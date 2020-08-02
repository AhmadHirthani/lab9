function Trails(data) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionStatus;
  this.condition_date = new Date(data.conditionDate).toLocaleDateString();
  this.condition_time = new Date(data.conditionDate).toLocaleTimeString('en-US', { hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric"});
  Trails.all.push(this);
}
Trails.all = [];


exports.default = Trails;
