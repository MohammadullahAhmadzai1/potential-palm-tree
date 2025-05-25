const express = require('express');
const Category = require('../models/category');
const req = require('express/lib/request');
const categoryRoute = express.Router();
categoryRoute.post('/api/categories', async(req, res)=>{
    try {
        const {name, image, banner} = req.body;
    const category =  new Category({name, image, banner});
    await category.save();
    res.status(201).send(category);
    } catch (e) {
        res.status(500).json({error: e.message});
    }  
});
categoryRoute.get('/api/categories', async(req, res)=>{
    try {
        const getCategories = await Category.find();
        res.status(200).json(getCategories);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
    
});
categoryRoute.delete('/api/delete-category/:categoryId', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const category = await Category.findByIdAndDelete(categoryId);
      
      if (!category) {
        return res.status(404).json({ msg: "Category not found" });
      }
      
      res.status(200).json({ msg: "Category deleted successfully" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
module.exports = categoryRoute;