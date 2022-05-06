let jbtnone = `
<div class="jumbotron">
<h1 class="display-4">No Results</h1>
<p class="lead">There are no items with those specifications</p>
<hr class="my-4">
<p>Or theres a problem with our server.</p>
</div>`

function query(fullUrl, mode, pag, page, limit) {
  try {
    document.getElementsByClassName("jumbotron")[0].remove();
  } catch {}
  let Url = fullUrl;
  let container = document.getElementById("results");
  container.innerHTML = "";
  fullUrl += `&page=${page}&limit=${limit}`
  const headers = { 'Accept': 'application/sparql-results+json' };
  fetch(fullUrl, { headers , method: "GET" }).then(body => body.json()).then(data => {
    console.log(data)
    let media = "";
    let desc = "";
    let title = "";
    let ProvidedCHO = "";
    let modalnum = 0;
    let itemlist = null;
    let count = null;

    itemlist = mode ? data.results.bindings : data.items;
    count = mode ? 1 : data.totalResults;
    count = (count<999) ? count : 959;
    console.log(itemlist.length);
    if(count === 0) {
      document.getElementById("cont").innerHTML += jbtnone;
      return false;
    }
    itemlist.forEach(element => {
      if (mode) {
        title = element.title.value;
        ProvidedCHO = element.ProvidedCHO.value;
        try { desc = element.description.value; }catch { desc = "None"; }
        media = `<img class="card-img-top" src="https://api.europeana.eu/thumbnail/v2/url.json?type=${element.type.value}&size=w400&uri=${element.mediaURL.value}"
        style="max-width: 100%;max-height: 100%;" alt=""/>`
      } else {
        title = element.title[0];
        ProvidedCHO = element.guid;
        try {desc = element.dcDescription[0];}catch {desc = "None";}
        media = `<img class="card-img-top" src="https://api.europeana.eu/thumbnail/v2/url.json?type=${element.type}&size=w1200&uri=${element.edmIsShownBy[0]}"
        style="max-width: 100%;max-height: 100%;" alt=""/>`
      }
      modalnum += 1;
      console.log(element)
      
      
      container.innerHTML += `
        <div class="card shadow-sm" style="width: 18rem;">
        ${media}
          <div class="card-body">
            <p class="card-text">${title}</p>
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
              Media:<br>${media}<br>
              Description:${desc}
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary floating-left" href="${ProvidedCHO}" target="_blank" rel="noopener noreferrer">Go to Europeana Website</a>
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
    });
    if(count > limit) {
      let paginations = `<nav>
        <ul class="pagination justify-content-center">
`
      let startpage = (page < 3) ? 1 : page - 2;
      let endpage = startpage + 4;
      let totalpage = Math.ceil(count/limit);
      endpage = (totalpage < endpage) ? totalpage : endpage;
      let diff = startpage - endpage + 4;
      startpage -= (startpage - diff > 0) ? diff : 0;
      if (startpage <= 0) {
          endpage -= (startpage - 1);
          startpage = 1;
      }
          
      if (endpage > count) {
        endpage = count;
      }
      if (startpage > 1) {
        paginations += `<li class="page-item">
        <a class="page-link" href="#">Previous</a>
      </li>`
      } else {
        paginations += `<li class="page-item disabled">
        <a class="page-link" href="#">Previous</a>
        </li>`
      }

      if( page > 3) {
        paginations += `<li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item disabled"><a class="page-link" href="#">...</a></li>`
      }
      for(let i=startpage; i<=endpage; i++){
        paginations += (i === page) ? `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>` : `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
      }

      if( page < totalpage - 3) {
        paginations += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>
        <li class="page-item"><a class="page-link" href="#">${totalpage}</a></li>`
      }

      if (page < totalpage) {
        paginations +=`<li class="page-item">
        <a class="page-link" href="#">Next</a>
      </li>`
      } else {
        paginations +=`<li class="page-item disabled">
        <a class="page-link" href="#">Next</a>
      </li>`
      }
          
      paginations +=`</ul>
      </nav>`
      pag.innerHTML = paginations;
      console.log(pag.innerHTML);

      let e = document.getElementsByClassName('page-link');
      for (var i = 0, len = e.length; i < len; i++) {
        e[i].addEventListener("click", function() {
        query(Url, mode, pag, parseInt(this.textContent), limit)
        console.log(this.textContent);
      });
}
    }
  });
}



document.getElementById('searchbtn').onclick = function () {
  document.getElementById("bef-click").setAttribute("hidden", true);
  document.getElementById("aft-click").removeAttribute("hidden");
  let pag = document.getElementById('pagination-container');
  let fullUrl = ""
  let search = document.getElementById('searchbox').value;
  // if(!/^[0-9a-zA-Z]+$/.test(search)) {
  //   try {
  //     document.getElementsByClassName("jumbotron")[0].remove();
  //   } catch {}
  //   document.getElementById("results").innerHTML = "";
  //   document.getElementById("cont").innerHTML += jbtnone;
  //   document.getElementById("aft-click").setAttribute("hidden", true);
  //   document.getElementById("bef-click").removeAttribute("hidden");
  //   return false;
  // }
  let mode = document.getElementById('local').checked;
  let imagecheck = document.getElementById('images').checked;
  let soundcheck = document.getElementById('sounds').checked;
  let textcheck = document.getElementById('texts').checked;
  let videocheck = document.getElementById('videos').checked;
  let threedcheck = document.getElementById('3ds').checked;
  console.log(imagecheck, soundcheck, textcheck, videocheck, threedcheck)


  if (mode) {
    const sparqlQuery = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX edm: <http://www.europeana.eu/schemas/edm/>
    PREFIX ore: <http://www.openarchives.org/ore/terms/>
    SELECT DISTINCT ?ProvidedCHO ?title ?type ?creator ?mediaURL ?date ?description ?view
    WHERE {
      ?Aggregation edm:aggregatedCHO ?ProvidedCHO ;
          edm:isShownBy ?mediaURL.
      ?Proxy ore:proxyFor ?ProvidedCHO ;
          dc:title ?title ;
          dc:date ?date ;
          dc:creator ?creator ;
          edm:type ?type ;
          edm:type "IMAGE".
      OPTIONAL { ?Proxy dc:description ?description }
      FILTER regex(?title, ".*${search.replace(" ", ".")}.*", "i")
    }
    LIMIT 21`;
    
    fullUrl = 'http://localhost:7200/repositories/Europeana' + '?query=' + encodeURIComponent(sparqlQuery) + '&queryLn=sparql&infer=false';
    console.log(sparqlQuery)
  } else {
    fullUrl = `/search?search=${search}&img=${imagecheck}&snd=${soundcheck}&txt=${textcheck}&vdo=${videocheck}&threed=${threedcheck}`
  }
  
  query(fullUrl, mode, pag, 1, 30);
  document.getElementById("aft-click").setAttribute("hidden", true);
  document.getElementById("bef-click").removeAttribute("hidden"); 
  return false;
};