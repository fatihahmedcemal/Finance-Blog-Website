const express = require("express");
const router = express.Router();
const subCategory = require("../schemas/subCategory");
const Category = require("../schemas/categorySchema");
const Chat = require("../schemas/chatSchema");
const Helpers = require("../schemas/helperProfile");

const categories = async () => {
    const categoriesList = await Category.find();
  
    return categoriesList
}

function popularSubCategories(array, length, limit) {
    if(length > 0) {
        let map = new Map();

        // Add new element
        // with the element in the array
        // as the id, and default value of one
        // as the number of times element occurs unless there is already an element
        // then you add 1 to the that count
        array.forEach(item => {
            if(map.has(item)) {
                map.set(item, map.get(item) + 1);
            } else {
                map.set(item, 1);
            }
        });
    
        // Creating an array using the map
        let arrayOfMap = [...map];
    
        // Sort the list:
        // If both items appear same number of times, 
        // latest one is above
        // if not the same then bigger number to smaller number
        arrayOfMap.sort((element1, element2) => {
            if (element1[1] == element2[1])
                return element1[0] - element2[0];
            else
                return element2[1] - element1[1];
        });
    
        var subCategories = [];
        // return the number of elements the system requests
        var numberOfElements = limit;
        if(limit > length) {
            numberOfElements = length;
        }
        for (let i = 0; i < numberOfElements; i++) {
            if(typeof arrayOfMap[i] !== 'undefined') {
                const item = arrayOfMap[i][0];
                subCategories.push(item);
            }
        }
        return subCategories
    } else {
        var subCategories = [];
        return subCategories
    }
}

router.get("/", async (req, res) => {
    const chats = await Chat.find();
    var subCategoryArray = [];
    if(chats.length > 1) {
        chats.forEach(chat => {
            if(chat.subCategory) subCategoryArray.push(chat.subCategory);
        });
    }
    res.render("discover.ejs", { categories: await categories(), popularSubCategories: popularSubCategories(subCategoryArray, subCategoryArray.length, 21) });
});

router.get("/categories", async (req, res) => {
    const categoryQuery = req.query.category.toLowerCase();
    const categoriesList = await categories();
    var categoryNames = []
    categoriesList.forEach(category => {
        categoryNames.push(category.name.toLowerCase());
    });
    if(!categoryNames.includes(categoryQuery)) return res.redirect("/dashboard");

    const subCategories = await subCategory.find({ category: categoryQuery });
    res.render("category.ejs", { subCategories, categories: await categories() });
});

router.get("/sub-categories", async (req, res) => {
    const subCategoryQuery = req.query.subCategory.toUpperCase();
    const subCategoryObject = await subCategory.findOne({ name: subCategoryQuery });
    if(!subCategoryObject) return res.redirect("/dashboard");

    const profiles = await Helpers.find({ subCategory: subCategoryObject.name });
    // this category
    const categoriesList = await Category.find();
    var thisCategory;
    categoriesList.forEach(category => {
        if(category.name.toLowerCase() == subCategoryObject.category) thisCategory = category.name;
    });
    res.render("subCategory.ejs", { profiles, categories: await categories(), thisCategory, thisSubCategory: subCategoryQuery });
});

router.get("/search", async (req, res) => {
    const value = req.query.value.toUpperCase();
    const words = value.split(" ");

    const helpersFound = []
    const helpers = await Helpers.find();

    helpers.forEach(helper => {
        const keywords = helper.name.split(" ");
        words.forEach(word => {
            if(keywords.includes(word)) {
                helpersFound.push(helper);
            }
        });
    });

    const subcategoriesFound = []
    const subcategories = await subCategory.find();

    subcategories.forEach(subcategory => {
        const keywords = subcategory.name.split(" ");
        words.forEach(word => {
            if(keywords.includes(word)) {
                subcategoriesFound.push(subcategory);
            }
        });
    });

    //const helpers = await Helpers.find({ name: value });
    //const subCategories = await subCategory.find({ name: value });
    // filters
    //if (req.query.cheapest == true)
    res.render("search.ejs", { helpersFound, subcategoriesFound, categories: await categories() });
});

router.get("/profiles", async (req, res) => {
    const userQuery = req.query.id;
    const userProfile = await Helpers.findById(userQuery);
    if(!userProfile) return res.redirect("/");

    var profileOfThisUser = false;
    if(typeof req.userProfile === "undefined" || req.userProfile === null) {
        profileOfThisUser = false;
    } else if(req.userProfile.email == userProfile.email) {
        profileOfThisUser = true;
    } else {
        profileOfThisUser = false;
    }

    const subCategories = await subCategory.find();

    res.render("profilePage.ejs", { userProfile, profileOfThisUser, subCategories });
});

router.post("/profiles", async (req, res) => {
    const userQuery = req.query.id;
    const userProfile = await Helpers.findById(userQuery);
    if(!userProfile) return res.redirect("/");
    const userId = { _id: userQuery}
    const itemsToUpdate = {
        description: req.body.description, 
        occupation: req.body.occupation,
        subCategory: req.body.subCategory.toUpperCase(),
        resume: req.body.resume
    }
    try {
        await Helpers.updateOne(userId, itemsToUpdate);
        console.log("It worked!");
        res.redirect("/");
    } catch (error) {
        console.log("Error!" + error);
        res.redirect("/");
    }
});

module.exports = router;