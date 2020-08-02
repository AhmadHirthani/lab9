function Movie(data){
  this.title=data.title;
  this.overview=data.overview;
  this.average_votes=data.vote_average;
  this.total_votes=data.vote_count;
  this.image_url=data.poster_path;
  this.popularity=data.popularity;
  this.released_on=data.release_date;
 
};



exports.default = Movie;








