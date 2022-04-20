function query(query) {
  const fullUrl = 'http://sparql.europeana.eu/' + '?query=' + encodeURIComponent(query);
  const headers = { 'Accept': 'application/sparql-results+json' };
  return fetch(fullUrl, { headers }).then(body => body.json())
}


document.getElementById('searchbtn').onclick = function () {
  console.log(1);
  document.getElementById("bef-click").setAttribute("hidden", true);
  document.getElementById("aft-click").removeAttribute("hidden");
  let parent = document.getElementById("cont");
  console.log(2);
  let container = document.getElementById("results");
  console.log(3);
  container.innerHTML = "";
  console.log(4);
  let search = document.getElementById('searchbox').value;
  let mode = false;


  if (mode) {
    search = search.replace(" ", ".");

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
      FILTER regex(?title, ".*${search}.*", "i")
    }
    LIMIT 21`;

    console.log(search)
    console.log(sparqlQuery)

    query(sparqlQuery).then(data => {
      console.log(data)
      let media = "";
      let desc = "";
      let modalnum = 0;

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
            media = `<img src="` + element.mediaURL.value + `" style="max-width: 100%;max-height: 100%;" onerror="this.onerror=null; this.src='./assets/not-found.png'" alt=""/>`;
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
      
    });

  } else {
    fetch("/search/" + search, {method: "GET"})
    .then(body => body.json())
    .then(data => {
      console.log(data)
      let media = "";
      let desc = "";
      let modalnum = 0;


      data.items.forEach(element => {
        console.log(element);
        try {
          desc = element.dcDescription[0];
        }
        catch {
          desc = "None";
        }
        modalnum += 1;
        switch(element.type) {
          case "IMAGE":
            //preview = `<img src="` + element.edmPreview[0] + `" style="max-width: 100%;max-height: 100%;" onerror="this.onerror=null; this.src='./assets/not-found.png'" alt=""/>`
            media = `<img src="` + element.edmIsShownBy[0] + `" style="max-width: 100%;max-height: 100%;" onerror="this.onerror=null; this.src='./assets/not-found.png'" alt=""/>`;
            break;
          case "SOUND":
            media = `<audio controls autoplay muted>
            <source src="` + element.edmIsShownBy[0] + `" type="audio/ogg">
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
              <p class="card-text">${element.title[0]}</p>
              <div class="d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-sm btn-outline-secondary stretched-link" data-bs-toggle="modal" data-bs-target="#scrollmodal${modalnum.toString()}">View</button>
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
                <a class="btn btn-primary floating-left" href="${element.guid}" target="_blank" rel="noopener noreferrer">Go to Europeana Website</a>
                <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        `
      });
    });
  }
  try {
    document.getElementsByClassName("jumbotron")[0].remove();
  } catch {}
  document.getElementById("aft-click").setAttribute("hidden", true);
  document.getElementById("bef-click").removeAttribute("hidden"); 
  return false;
};