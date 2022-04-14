function query(query) {
  const fullUrl = 'http://sparql.europeana.eu/' + '?query=' + encodeURIComponent(query);
  const headers = { 'Accept': 'application/sparql-results+json' };
  return fetch(fullUrl, { headers }).then(body => body.json())
}

function queryProcessor(query) {
  return query.replace(" ", ".*")
}

document.getElementById('SearchForm').onsubmit = function () {
  document.getElementById("bef-click").setAttribute("hidden", true);
  document.getElementById("aft-click").removeAttribute("hidden"); 
  let search = document.getElementById('searchbox').value;
  


  const sparqlQuery = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX edm: <http://www.europeana.eu/schemas/edm/>
  PREFIX ore: <http://www.openarchives.org/ore/terms/>
  SELECT DISTINCT ?ProvidedCHO ?title ?type ?creator ?mediaURL ?date ?description ?view
  WHERE {
    ?Aggregation edm:aggregatedCHO ?ProvidedCHO ;
        edm:isShownBy ?mediaURL ;
        edm:preview ?view .
    ?Proxy ore:proxyFor ?ProvidedCHO ;
        dc:title ?title ;
        dc:date ?date ;
        dc:creator ?creator ;
        edm:type ?type ;
        edm:type "IMAGE".
    OPTIONAL { ?Proxy dc:description ?description }
    FILTER regex(?title, ".*`+ queryProcessor(search) + `.*", "i")
  }
  LIMIT 21`;

  console.log(search)
  console.log(sparqlQuery)

  query(sparqlQuery).then(data => {
    console.log(data)
    let media = "";
    let desc = "";
    let modalnum = 0;
    let parent = document.getElementById("results");
    let container = document.createElement('div');
    container.className = "card-columns";


    data.results.bindings.forEach(element => {
      try {
        desc = element.description.value;
      }
      catch {
        desc = "None";
      }
      modalnum += 1;
      console.log(element)
      switch(element.type.value) {
        case "IMAGE":
          media = `<img src="` + element.mediaURL.value + `" style="max-width: 100%;max-height: 100%;" onerror="this.onerror=null; this.src='../assets/not-found.png'" alt=""/>`;
          break;
        case "SOUND":
          media = `<audio controls autoplay muted>
          <source src="` + element.mediaURL.value + `" type="audio/ogg">
          <source src="horse.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
        </audio>`
          break;
        default:
          // code block
      }
      container.innerHTML += `
        <div class="card shadow-sm">
        ${media}
          <div class="card-body">
            <p class="card-text">${element.title.value}</p>
            <div class="d-flex justify-content-between align-items-center">
              <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#scrollmodal${modalnum.toString()}">View</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="scrollmodal${modalnum.toString()}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel${modalnum.toString()}" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel${modalnum.toString()}">Modal title</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Media:<br>` + media + `<br>
              
              Description: ` + 
              desc
               + `
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary floating-left" href="${element.ProvidedCHO.value}" target="_blank" rel="noopener noreferrer">Go to Europeana Website</a>
              <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
    });
    document.getElementsByClassName("jumbotron")[0].remove()
    parent.appendChild(container);
    document.getElementById("aft-click").setAttribute("hidden", true);
    document.getElementById("bef-click").removeAttribute("hidden"); 
  });

  return false;
};