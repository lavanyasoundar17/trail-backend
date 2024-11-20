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
exports.fetchPosts = (longitude, latitude, sort_by = 'created_at', order = 'desc') => {
    console.log(typeof(sort_by),"sort_by model")
    console.log(typeof(order),"order_by model")
    const validSortBys = ['created_at'];
    const validOrders = ['desc', 'asc'];
    // Validate sort_by and order parameters
    if(!validSortBys.includes(sort_by)) {
        return Promise.reject({status: 400, msg: 'Invalid sort_by query'});
    }
    if(!validOrders.includes(order)) {
        return Promise.reject({status: 400, msg: 'Invalid order query, must be either desc or asc'});
    }
    // SQL query to find posts within 10 km (10000 meters) of the user's location
    const query = (`
        SELECT *
        FROM posts
        WHERE ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326), -- User's lat, lon converted to geometry
            10000 -- 10 km distance in meters
        )
        ORDER BY ${sort_by} ${order};`)
    return db.query(query, [longitude, latitude])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'No posts found within 10 km' });
            }
            return rows;
        });
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