const express = require('express');
const SubCategory = require('../models/sub_category');
const subCategoryRoute = express.Router();
subCategoryRoute.post('/api/subCategories', async (req, res)=>{
    try {
    const {categoryId, categoryName, image, subCategoryName}=req.body;
    const subCategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
    await subCategory.save();
    return res.status(201).json({subCategory});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});
subCategoryRoute.get('/api/subCategories', async (req, res)=>{
    try {
        const subcategories = await SubCategory.find();
        return res.status(200).json(subcategories);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
})
subCategoryRoute.get('/api/categories/:categoryName/subCategories', async(req, res)=>{
    try {
        const {categoryName} = req.params;
        const subCategory = await SubCategory.find({categoryName:categoryName})
        if(!subCategory || subCategory.length == 0){
            return res.status(404).json({msg: "SubCategories not found"});
        }else{
            return res.status(200).json({subCategory});
        }

    } catch (e) {
        res.status(500).json({error: e.message});
    }
    
});
subCategoryRoute.delete('/api/delete-subCategory/:subCategoryId', async (req, res) => {
    try {
      const { subCategoryId } = req.params;
      const subCategory = await SubCategory.findByIdAndDelete(subCategoryId);
      
      if (!subCategory) {
        return res.status(404).json({ msg: "Subcategory not found" });
      }
      
      res.status(200).json({ msg: "Subcategory deleted successfully" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
module.exports = subCategoryRoute;
    