const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('node:fs')


const Book = require('../models/book')
const Author= require('../models/author')

const uploadPath = path.join('public', Book.coverBaseImagePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//all books routes
router.get('/', async (req,res) =>{
    let query = Book.find()
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    try{
        const books = await Book.find({})
        res.render('books/index',{
            books: books,
            searchOptions: req.query})
    } catch{
            res.redirect('/')
    }
})

//new books route

router.get('/new', async (req,res)=> {
  renderNewPage(res, new Book())
})

//create books route

router.post('/', upload.single('cover'), async (req,res) => {
    const fileName = req.file != null ? req.file.fileName : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try{
        const newBook  = await book.save()
        //res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch{
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
            }

        renderNewPage(res, book, true)
    }

 
    })  

    function removeBookCover(fileName) {
    try {
        fs.unlink(path.join(uploadPath, fileName));
        console.log(`File ${fileName} removed successfully.`);
    } catch (err) {
        console.error(`Error removing file ${fileName}:`, err.message);
    }
    }
    
    async function renderNewPage(res, book, hasError = false){
        try{
            const authors = await Author.find({})
            const params = {
                authors: authors,
                book: book
            }
            res.render('books/new', params)
           }catch{
            if(hasError) {params.errorMessage = 'Error adding Book'}
            res.redirect('/books')
           }
    }
    
module.exports = router