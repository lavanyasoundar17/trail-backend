const format = require('pg-format');
const db = require('../connection');
const {
  convertTimestampToDate,
  createRef,
  formatPosts,
} = require('./utils');
const seed = ({ usersData, postsData, favouritesData }) => {
    return db
      .query(`DROP TABLE IF EXISTS favourites;`)
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS posts;`);
      })
      .then(() => {
        return db.query(
        `DROP EXTENSION IF EXISTS postgis;`
        )
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users;`);
      })
      .then(() => {
        return db.query(`
          CREATE EXTENSION postgis;`)
      })
      .then(() => {
        return db.query(`
        CREATE TABLE users (
          username VARCHAR PRIMARY KEY,
          name VARCHAR NOT NULL,
          profile_img VARCHAR,
          points INT DEFAULT 0 NOT NULL
        );`)
      })
      .then(() => {
        return db.query(`
        CREATE TABLE posts (
          post_id SERIAL PRIMARY KEY,
          username VARCHAR NOT NULL REFERENCES users(username),
          post_img VARCHAR,
          description VARCHAR NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          location GEOGRAPHY(Point, 4326) -- Using PostGIS Geography type to store the location
        );`);
      })
      .then(() => {
        // Create a spatial index on the location column using GiST
        return db.query(`
          CREATE INDEX posts_geo_index
          ON posts
          USING GIST (location);
        `);
      })
      // .then(() => {
      //   return db.query(
      //     `CREATE INDEX posts_geo_index
      //     ON posts
      //     USING GIST (location);`
      //   )
      // })
      .then(() => {
        return db.query(`
        CREATE TABLE favourites (
          username VARCHAR NOT NULL REFERENCES users(username),
          post_id INT NOT NULL REFERENCES posts(post_id),
          PRIMARY KEY (username, post_id)
        );`);
      })
      .then(() => {
        const insertUsersQueryStr = format(
          'INSERT INTO users (username, name, profile_img, points) VALUES %L;',
          usersData.map(({ username, name, profile_img, points }) => [
            username,
            name,
            profile_img,
            points
          ])
        );
        return db.query(insertUsersQueryStr);
      })
      .then(() => {
        const insertPostsQueryStr = format(
                'INSERT INTO posts (username, post_img, description, created_at, location) VALUES %L;',
                postsData.map(({ username, post_img, description, created_at, location }) => [
                    username,
                    post_img,
                    description,
                    created_at,
                    `ST_GeomFromText('${location}', 4326)` // Properly format the POINT data
                ])
            );
            return db.query(insertPostsQueryStr);
      })
      .then(() => {
        const insertFavouritesQueryStr = format(
          'INSERT INTO favourites (username, post_id) VALUES %L;',
          favouritesData.map(({ username, post_id }) => [
            username,
            post_id
          ])
        );
        return db.query(insertFavouritesQueryStr);
      })
  };
  module.exports = seed;