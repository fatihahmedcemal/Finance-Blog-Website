const express = require("express");
const router = express.Router();

const User = require("../schemas/userSchema");
const Category = require("../schemas/categorySchema");
const SubCategory = require("../schemas/subCategory.js");

function checkUser(req, res, next) {
    if(req.user && req.user.role == "Admin") {
        next()
    } else {
        res.redirect("/");
    }
}

router.get("/", checkUser, (req, res) => {
    console.log(req.user);
    res.render("admin.ejs");
});

router.get("/new/sub-category", checkUser, async (req, res) => {
    const categories = await Category.find();
    res.render("form.ejs", { form: "Sub Category", categories });
});

router.post("/new/sub-category", checkUser, async (req, res) => {
    var subcategory = new SubCategory({
        category: req.body.category.toLowerCase(),
        name: req.body.name.toUpperCase()
    }); 
    try {
        subcategory = await subcategory.save();
        res.redirect("/dashboard");
        console.log(subcategory);
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.get("/new/category", checkUser, (req, res) => {
    res.render("form.ejs", { form: "Category" });
});

router.post("/new/category", checkUser, async (req, res) => {
    var category = new Category({
        name: req.body.name
    }); 
    try {
        category = await category.save();
        res.redirect("/dashboard");
        console.log(category);
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = router;