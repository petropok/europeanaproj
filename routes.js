const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render("pages/index");
})

router.get('/search', (req, res) => {
    res.render("pages/search");
})

router.post('/', (req,res) => {
    var query = req.body.search;
    var htmlData = 'Hello:' + query;
    if(query) {
        res.render("pages/search", {term:query});
    } else {
        res.render("pages/index");
    }
 });
module.exports = router;