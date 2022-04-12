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

const sparqlQuery = `
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX ore: <http://www.openarchives.org/ore/terms/>
SELECT DISTINCT ?title ?creator ?mediaURL ?date
WHERE {
  ?CHO edm:type "SOUND" ;
      ore:proxyIn ?proxy;
      dc:title ?title ;
      dc:creator ?creator;
      dc:date ?date .
  ?proxy edm:isShownBy ?mediaURL .
  FILTER (?date > "1780" && ?date < "1930")
}
ORDER BY asc (?date)
LIMIT 100`;

document.getElementById('SearchForm').onsubmit = function() { 
    console.log(document.getElementById('searchbox').value);
    const queryDispatcher = new SPARQLQueryDispatcher( 'http://sparql.europeana.eu/' );
    queryDispatcher.query( sparqlQuery ).then( console.log );
    let search = document.getElementById('searchbox').value;

    return false;
};