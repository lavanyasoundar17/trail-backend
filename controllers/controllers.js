const {fetchUsersByUsername, fetchPosts, fetchPostById} = require('../models/models')

exports.getUsersByUsername = (request, response, next) => {
    const { username } = request.params;
    fetchUsersByUsername(username)
    .then((userData) => {
        response.status(200).send({user: userData})
    })
    .catch((error) => {
        next(error)
    })
}

const { fetchPosts } = require('../models/models');
///////
exports.getPosts = (request, response, next) => {
    const { sort_by, order, latitude, longitude } = request.query;
    
    // Ensure latitude and longitude are provided
    if (!latitude || !longitude) {
        return response.status(400).send({ msg: 'Latitude and longitude are required' });
    }

    fetchPosts(parseFloat(latitude), parseFloat(longitude), sort_by, order)
        .then((posts) => {
            response.status(200).send({ posts });
        })
        .catch(next);
};
/////

exports.getPostById = (request, response, next) => {
    const {post_id} = request.params
    fetchPostById(post_id)
    .then((post) => {
        response.status(200).send({post})
    })
    .catch(next)
}