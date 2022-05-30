let jbtnone = `
<div class="jumbotron">
<h1 class="display-4">No Results</h1>
<p class="lead">There are no items with those specifications</p>
<hr class="my-4">
<p>Or theres a problem with our server.</p>
</div>`

function databaseAdding(search, offset, cache) {

  let where = search.match(/where:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let who = search.match(/who:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let when = search.match(/when:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let title = search.match(/title:(\w+|".+"|\((\s*\w+\s*(\s+OR\s+\w+)*\s*)\))/);
  let qf = [];
  let qftext = '';
  if(cache.imagecheck){ qf.push('"IMAGE"'); }
  if(cache.soundcheck){ qf.push('"SOUND"'); }
  if(cache.textcheck){ qf.push('"TEXT"'); }
  if(cache.videocheck){ qf.push('"VIDEO"'); }
  if(cache.threedcheck){ qf.push('"3D"'); }

  for(let i=0; i<qf.length; i++) {
    qftext += qf[i];
    if(i+1 != qf.length) {
      qftext += ' || ';
    }
  }

  let sparqlQuery = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX edm: <http://www.europeana.eu/schemas/edm/>
  PREFIX ore: <http://www.openarchives.org/ore/terms/>
  SELECT DISTINCT ?Aggregation ?ProvidedCHO ?title ?type ?creator ?mediaURL ?date ?description ?view ?country
  WHERE {
    ?s edm:country ?country .
    ?Aggregation edm:aggregatedCHO ?ProvidedCHO ;
        edm:isShownBy ?mediaURL.
    ?Proxy ore:proxyFor ?ProvidedCHO ;
        dc:title ?title ;
        dc:date ?date ;
        dc:creator ?creator ;
        edm:type ?type .
    OPTIONAL { ?Proxy dc:description ?description }
  `;

  if(where != null) {
    where[1] = where[1].replace(/[()]/g, '');
    search = search.replace(where[0], '');
    where[1] = where[1].replace(/["]/g, '');
    let splitwhere = where[1].split(' OR ');
    let fullwhere =  "";
    for(let i=0; i<splitwhere.length; i++) {
      fullwhere += `.*${splitwhere[i]}.*`;
      if(i+1 != splitwhere.length) {
        fullwhere += '|';
      }
    }
    sparqlQuery += `FILTER regex(?country, "${fullwhere.replace(" ", ".*")}", "i")
    `
  }

  if(who != null) {
    who[1] = who[1].replace(/[()]/g, '');
    search = search.replace(who[0], '');
    who[1] = who[1].replace(/["]/g, '');
    let splitwho = who[1].split(' OR ');
    let fullwho =  "";
    for(let i=0; i<splitwho.length; i++) {
      fullwho += `.*${splitwho[i]}.*`;
      if(i+1 != splitwho.length) {
        fullwho += '|';
      }
    }
    sparqlQuery += `FILTER regex(?creator, "${fullwho.replace(" ", ".*")}", "i")
    `
  }

  if(when != null) {
    when[1] = when[1].replace(/[()]/g, '');
    search = search.replace(when[0], '');
    when[1] = when[1].replace(/["]/g, '');
    let splitwhen = when[1].split(' OR ');
    let fullwhen =  "";
    for(let i=0; i<splitwhen.length; i++) {
      fullwhen += `.*${splitwhen[i]}.*`;
      if(i+1 != splitwhen.length) {
        fullwhen += '|';
      }
    }
    sparqlQuery += `FILTER regex(?date, "${fullwhen.replace(" ", ".*")}", "i")
    `
  }

  if(title != null) {
    title[1] = title[1].replace(/[()]/g, '');
    search = search.replace(title[0], '');
    title[1] = title[1].replace(/["]/g, '');
    let splittitle = title[1].split(' OR ');
    let fulltitle =  "";
    for(let i=0; i<splittitle.length; i++) {
      fulltitle += `.*${splittitle[i]}.*`;
      if(i+1 != splittitle.length) {
        fulltitle += '|';
      }
    }
    sparqlQuery += `FILTER regex(?title, "${fulltitle.replace(" ", ".*")}", "i")
    `
  } else {
    sparqlQuery += `FILTER regex(?title, ".*${search.replace(" ", ".*")}.*", "i")
    `
  }

  sparqlQuery += `FILTER(STR(?type) = ${qftext})
  }`
  return `http://localhost:7200/repositories/Europeana?query=${encodeURIComponent(sparqlQuery)}&queryLn=sparql&infer=false&limit=30&offset=${offset}`;
}

function query(search, pag, page, limit, cache) {
  try {document.getElementById("pagnav").remove();} catch {}
  try {document.getElementsByClassName("jumbotron")[0].remove();} catch {}
  let container = document.getElementById("results");
  let fullUrl = "";
  container.innerHTML = "";
  
  if (cache.mode) {
    fullUrl = databaseAdding(search, (page-1)*limit, cache);
  } else {
    fullUrl = `/search?search=${search}&img=${cache.imagecheck}&snd=${cache.soundcheck}&txt=${cache.textcheck}&vdo=${cache.videocheck}&threed=${cache.threedcheck}&page=${page}&limit=${limit}`;
  }
  const headers = { 'Accept': 'application/sparql-results+json' };
  fetch(fullUrl, { headers , method: "GET" }).then(body => body.json()).then(data => {
    let media = "";
    let desc = "";
    let title = "";
    let ProvidedCHO = "";
    let modalnum = 0;
    let itemlist = null;
    let count = null;

    itemlist = cache.mode ? data.results.bindings : data.items;
    count = cache.mode ? itemlist.length : data.totalResults;
    count = (count<999) ? count : 959;
    if(count === 0) {
      document.getElementById("cont").innerHTML += jbtnone;
      return false;
    }
    itemlist.forEach(element => {
      if (cache.mode) {
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
              <h5 class="modal-title" id="staticBackdropLabel${modalnum.toString()}">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">${media}<br><br>
              <strong>Description:</strong><hr>
              ${desc}
            </div>
            <div class="modal-footer">
              <a class="btn btn-primary floating-left" href="${ProvidedCHO}" target="_blank" rel="noopener noreferrer">Go to Europeana Website</a>
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `
    });
    if (cache.mode) {
      let paginations = `<nav id="pagnav">
          <ul class="pagination justify-content-center">
      `  
      if ( page > 1) {
        paginations += `<li class="page-item">
        <a class="page-link prev" href="#">Previous</a>
        </li>`
      } else {
        paginations += `<li class="page-item disabled">
        <a class="page-link prev" href="#">Previous</a>
        </li>`
      }
      paginations += `<li class="page-item" disabled><a class="page-link" href="#">${page}</a></li>`
      if (count >= limit) {
        paginations +=`<li class="page-item">
        <a class="page-link nex" href="#">Next</a>
        </li>`
      } else {
        paginations +=`<li class="page-item disabled">
        <a class="page-link nex" href="#">Next</a>
        </li>`
      }
      paginations +=`</ul>
      </nav>`
      pag.innerHTML = paginations;

      document.getElementsByClassName('prev')[0].addEventListener("click", function() {
        query(search, pag, page-1, limit, cache);
      });
      document.getElementsByClassName('nex')[0].addEventListener("click", function() {
        query(search, pag, page+1, limit, cache);
      });
      
  } else { 
      if(count > limit) {
        let paginations = `<nav id="pagnav">
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
        if (page > 1) {
          paginations += `<li class="page-item">
          <a class="page-link prev" href="#">Previous</a>
        </li>`
        } else {
          paginations += `<li class="page-item disabled">
          <a class="page-link prev" href="#">Previous</a>
          </li>`
        }

        if( page > 3) {
          paginations += `<li class="page-item"><a class="page-link num" href="#">1</a></li>
          <li class="page-item disabled"><a class="page-link" href="#">...</a></li>`
        }
        for(let i=startpage; i<=endpage; i++){
          paginations += (i === page) ? `<li class="page-item active"><a class="page-link num" href="#">${i}</a></li>` : `<li class="page-item"><a class="page-link num" href="#">${i}</a></li>`
        }

        if( page < totalpage - 3) {
          paginations += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>
          <li class="page-item"><a class="page-link num" href="#">${totalpage}</a></li>`
        }

        if (page < totalpage) {
          paginations +=`<li class="page-item">
          <a class="page-link nex" href="#">Next</a>
        </li>`
        } else {
          paginations +=`<li class="page-item disabled">
          <a class="page-link nex" href="#">Next</a>
        </li>`
        }
            
        paginations +=`</ul>
        </nav>`
        pag.innerHTML = paginations;

        let e = document.getElementsByClassName('num');
        for (var i = 0, len = e.length; i < len; i++) {
          e[i].addEventListener("click", function() {
            query(search, pag, parseInt(this.textContent), limit, cache)
          });
        }
        document.getElementsByClassName('prev')[0].addEventListener("click", function() {
          query(search, pag, page-1, limit, cache)
        });
        document.getElementsByClassName('nex')[0].addEventListener("click", function() {
          query(search, pag, page+1, limit, cache)
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
  const cache = {
    mode : document.getElementById('local').checked ,
    imagecheck : document.getElementById('images').checked ,
    soundcheck : document.getElementById('sounds').checked ,
    textcheck : document.getElementById('texts').checked ,
    videocheck : document.getElementById('videos').checked ,
    threedcheck : document.getElementById('3ds').checked
  }
  
  query(search, pag, 1, 30, cache);

  document.getElementById("aft-click").setAttribute("hidden", true);
  document.getElementById("bef-click").removeAttribute("hidden"); 
  return false;
};