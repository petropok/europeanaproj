const express = require("express")
const fetch = require('cross-fetch');
const app = express()
const PORT = 3000
const router = require("./routes");

app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `#Get information of Europeana item using federated query
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX ore: <http://www.openarchives.org/ore/terms/>

SELECT * WHERE {
  BIND(<http://data.europeana.eu/proxy/provider/91622/raa_kmb_16000200042758> as ?p854)  
  SERVICE <http://sparql.europeana.eu/> {
   {
         ?p854 <http://purl.org/dc/terms/created> ?created .
         ?p854 <http://purl.org/dc/elements/1.1/identifier> ?identifier .
         ?p854 <http://purl.org/dc/elements/1.1/publisher> ?publisher .
         ?p854 <http://purl.org/dc/elements/1.1/rights> ?rights .
         ?p854 <http://purl.org/dc/elements/1.1/title> ?title .
         ?p854 <http://purl.org/dc/elements/1.1/description> ?description .
     }
  }
}`;


//Use external routes
app.use("/", router);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
    queryDispatcher.query( sparqlQuery ).then( console.log );
});