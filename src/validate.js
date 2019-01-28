#!/usr/bin/env node
const fs = require("fs");
const SHACLValidator = require("shacl-js");
const request = require("then-request");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");

const sections = [
  {
    header: "SHACL Validator",
    content: "Valdiate RDF against SHACL shapes."
  },
  {
    header: "Options",
    optionList: [
      {
        name: "endpoint",
        alias: "e",
        typeLabel: "{underline URL}",
        description: "The URL for a SPARQL endpoint used to access named graphs or run queries. " +
            " Must be specified unless local files are used for both data and shapes."
      },
      {
        name: "shapes",
        alias: "s",
        typeLabel: "{underline location}",
        description: "The location of the SHACL shapes. If specified as {underline @file}," +
            " shapes will be read from a local Turtle {underline file}. If specified as " +
            " {underline <graph>}, the named graph will be retrieved from the SPARQL endpoint." +
            " Otherwise, the actual argument is interpreted as Turtle shapes."
      },
      {
        name: "data",
        alias: "d",
        typeLabel: "{underline location}",
        description: "The location of the data to be validated. If specified as {underline @file}," +
            " data will be read from a local Turtle {underline file}. If specified as " +
            " {underline <graph>}, the named graph will be retrieved from the SPARQL endpoint." +
            " Otherwise, the actual argument is interpreted as Turtle data. Cannot be specified if" +
            " {bold --query} is provided."
      },
      {
        name: "query",
        alias: "q",
        typeLabel: "{underline query}",
        description: "Query to retrieve the data to be validated. If specified as {underline @file}," +
            " query will be read from a local {underline file}. " +
            " Otherwise, the actual argument is interpreted as SPARQL query. Cannot be specified if" +
            " {bold --data} is provided."
      },
      {
        name: "help",
        description: "Print this usage guide."
      }
    ]
  }
];

const optionDefinitions = [
  { name: "endpoint", alias: "e", type: String },
  { name: "shapes", alias: "s", type: String },
  { name: "data", alias: "d", type: String },
  { name: "query", alias: "q", type: String },
  { name: "help", alias: "h", type: Boolean }
];

const options = commandLineArgs(optionDefinitions);

function usage() {
    console.log(commandLineUsage(sections));
}

if (options.help) {
    usage();
    process.exit(0);
}

const endpoint = options.endpoint;

if (options.data && options.query) {
    console.log("Cannot specify both data and query");
    process.exit(1);
} else if (!options.data && !options.query) {
    console.log("Must specify either data or query");
    process.exit(1);
}

function resolve_text(reference, handle) {
    if (reference.startsWith("@")) {
        fs.readFile(reference.substr(1), "utf-8", (err, data) => { handle(data)});
    } else {
        return reference;
    }
}

function resolve(reference, handle) {
    if (reference.startsWith("<")) {
        load_graph(encodeURIComponent(reference), handle);
    } else {
        resolve_text(reference, handle);
    }
}

function run_validation(data, shapes) {
    var validator = new SHACLValidator();
    validator.validate(data, "text/turtle", shapes, "text/turtle", function (e, report) {
        console.log("Conforms? " + report.conforms());
        if (report.conforms() === false) {
            report.results().forEach(function(result) {
                console.log(" - Severity: " + result.severity() + " for " + result.sourceConstraintComponent());
            });
        }
    });
}

function endpoint_required()
{
  if (!endpoint) {
    console.log("Must specify SPARQL endpoint to access named graph");
    usage();
    process.exit(1);
  }
}

function load_graph(graph, handle) {
  endpoint_required();
  request("GET", endpoint + "/statements?context=" + graph,
    {"headers": { "Accept" : "text/turtle"}}).getBody("utf8").done(handle);
}

function run_query(query, handle) {
  endpoint_required();

  request("POST", endpoint, {
    "headers": { "Accept" : "text/turtle", "Content-Type": "application/x-www-form-urlencoded"},
    "body": "query=" + encodeURIComponent(query)
   }).getBody("utf8").done(handle);
}

resolve(options.shapes, (res) => {
  shapes = res;
  if (options.data) {
     resolve(options.data, (data) => run_validation(data, shapes));
  } else {
     resolve_text(options.query, (query) => run_query(query, (data) => run_validation(data, shapes)));
  }
});
