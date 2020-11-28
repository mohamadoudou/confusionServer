const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const router = require('.');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req, res, next) => {
    Favorites.find({user:req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id})
        .then((favorite) => {
            if (favorite != null) {
                req.body.forEach((id)=>{ 
                    if(favorite.dishes.indexOf(id._id)===-1){
                    favorite.dishes.push(id);
                    }
                })
                favorite.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
            }
            else if(favorite==null) {
                Favorites.create({})
                .then((favorite)=>{
                    favorite.user = req.user._id; 
                    req.body.forEach((id)=>{ favorite.dishes.push(id);})
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                })
            }
            else{
                    err = new Error('no Favorite found');
                    err.statusCode = 404;
                    return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOneAndDelete({user:req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
			        res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);     
                }, (err) => next(err))
            }
            else{
                err = new Error('Dish ' + req.params.dishId + ' already exist');
                err.status = 403;
                return next(err);
            }
        }
        else {
            Favorites.create({})
            favorite.user = req.user._id; 
            favorite.dishes.push(req.params.dishId)
            favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {            
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0 ) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
			        res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});
module.exports = favoriteRouter;