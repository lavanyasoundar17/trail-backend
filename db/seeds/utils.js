exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
    if (!created_at) return { ...otherProperties };
    return { created_at: new Date(created_at), ...otherProperties };
  };
  
  exports.createRef = (arr, key, value) => {
    return arr.reduce((ref, element) => {
      ref[element[key]] = element[value];
      return ref;
    }, {});
  };
  
  exports.formatPosts = (posts, idLookup) => {
    return posts.map(({ created_by, belongs_to, ...restOfPosts }) => {
      const post_id = idLookup[belongs_to];
      return {
        post_id,
        username: created_by,
        ...this.convertTimestampToDate(restOfPosts),
      };
    });
  };
  