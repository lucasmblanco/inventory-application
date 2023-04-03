#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Album = require("./models/album");
const Artist = require("./models/artist");
const Song = require("./models/song");
const Genre = require("./models/genre");
const Status = require("./models/status");
const fs = require("fs/promises"); 
const path = require('path');

const genres = [];
const songs = [];
const artists = [];
const albums = [];
const statuses = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createGenres();
  await createArtists();
  await createAlbums();
  await createSongs(); 
  await createStatuses();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function genreCreate(name) {
  const genre = new Genre({ name: name });
  await genre.save();
  genres.push(genre);
  console.log(`Added genre: ${name}`);
}

async function artistCreate(name, formation_year, disbandment_year, biography, photo) {
  const coverData = await fs.readFile(path.join(__dirname, `ArtistPhotos/${photo}.jpg`)); 
  const cover64 = Buffer.from(coverData).toString('base64');

  artistdetail = { name: name,  biography: biography, photo: cover64};
  if (formation_year != false) artistdetail.formation_year = formation_year;
  if (disbandment_year != false) artistdetail.disbandment_year = disbandment_year;

  const artist = new Artist(artistdetail);

  await artist.save();
  artists.push(artist);
  console.log(`Added artist: ${name}`);
}

async function songCreate(title, artist, album, track_number, duration, genre) {
  songDetail = {
    title: title,
    artist: artist,
    album: album,
    track_number: track_number, 
    duration: duration,
    genre: genre
  }; 

  if (genre != false) songDetail.genre = genre;

  const song = new Song(songDetail); 
  await song.save(); 
  songs.push(song); 
  console.log(`Added song: ${title} by ${artist.name} in ${album.title}`)
}

async function albumCreate(title, artist, cover, release_year, genre) {
  const coverData = await fs.readFile(path.join(__dirname, `AlbumCovers/${cover}.jpg`)); 
  const cover64 = Buffer.from(coverData).toString('base64');

  albumDetail = {
    title: title,
    artist: artist,
    cover: cover64,
    release_year: release_year,
    genre: genre,
    songs: songs
  };
  if (genre != false) albumDetail.genre = genre;

  const album = new Album(albumDetail);
  await album.save();
  albums.push(album);
  console.log(`Added album: ${title}`);
}

async function statusCreate(artist, listeners, followers) {
  statusDetail = {
    artist: artist,
    monthly_listeners: listeners,
    followers: followers
  };

  const status = new Status(statusDetail);
  await status.save();
  statuses.push(status);
  console.log(`Added status for ${artist.name}`);
}

async function createGenres() {
  console.log("Adding Genres");
  await Promise.all([
    genreCreate("Rock"),
    genreCreate("Pop"),
    genreCreate("Hip Hop"),
    genreCreate("Metal"),
    
  ]);
}



async function createArtists() {
  console.log("Adding Artists");
  await Promise.all([
    artistCreate("Miley Cyrus", 2001, false,
      "Miley Cyrus is an American singer, songwriter, and actress. She first gained fame as the star of the Disney Channel series 'Hannah Montana' and later transitioned to a successful career as a pop musician. Cyrus has released several multi-platinum albums and has had numerous hit singles, including 'Party in the U.S.A.', 'Wrecking Ball', and 'Malibu.' She is known for her edgy, provocative image and her willingness to push the boundaries of pop music and culture. In addition to her music career, Cyrus has also acted in several films and television shows and is a passionate advocate for a variety of social causes, including LGBTQ+ rights and animal welfare.",
    "MileyCyrus"),
    artistCreate("Linkin Park", 1996, 2017,
      "Linkin Park was an American rock band formed in 1996. The band's original lineup consisted of vocalist Chester Bennington, drummer Rob Bourdon, guitarist Brad Delson, bassist Dave 'Phoenix' Farrell, DJ Joe Hahn, and rapper Mike Shinoda. Linkin Park rose to international fame with their debut album 'Hybrid Theory', which became one of the best-selling albums of the 21st century. The band's music was a blend of alternative rock, nu-metal, and electronic influences, and their sound was characterized by Bennington's powerful vocals and Shinoda's rapping. Linkin Park released several other successful albums over the years, including 'Meteora', 'Minutes to Midnight', and 'A Thousand Suns'. In 2017, Bennington tragically died by suicide, and the band subsequently announced their disbandment. Throughout their career, Linkin Park was known for their emotionally charged lyrics and their willingness to experiment with different genres and styles.",
    "LinkinPark"),
    artistCreate("Drake", 2001, false,
      "Drake is a Canadian rapper, singer, songwriter, and actor. He first gained recognition for his role on the teen drama series 'Degrassi: The Next Generation', but soon transitioned to a successful music career with his debut album, 'Thank Me Later', in 2010. Drake has since become one of the biggest names in hip-hop and R&B, with several chart-topping albums and hit singles to his name, including 'One Dance', 'Hotline Bling', and 'In My Feelings'. His music often deals with themes of love, relationships, and personal growth, and he is known for his smooth, melodic flow and introspective lyrics. In addition to his music career, Drake has also made appearances in several films and television shows, and has been involved in various philanthropic and entrepreneurial endeavors.",
    "Drake"),
    artistCreate("Metallica", 1981, false,
      "Metallica is an American heavy metal band formed in 1981. The band's original lineup consisted of vocalist/guitarist James Hetfield, drummer Lars Ulrich, guitarist Dave Mustaine, and bassist Ron McGovney. Over the years, the band has undergone several lineup changes, with Hetfield and Ulrich remaining as the core members. Metallica is one of the most successful and influential heavy metal bands of all time, with over 125 million albums sold worldwide. Their music is characterized by aggressive guitar riffs, complex song structures, and introspective lyrics that deal with themes of anger, frustration, and personal struggle. Some of their most famous songs include 'Master of Puppets', 'Enter Sandman', and 'Nothing Else Matters'. Metallica has also been known for their activism and philanthropic work, particularly in the areas of environmentalism and disaster relief.",
    "Metallica"),
    artistCreate("Taylor Swift", 2004, false,
      "Taylor Swift is an American singer-songwriter who first gained fame with her country-pop debut album, 'Taylor Swift', in 2006. Over the years, Swift has become one of the most successful and acclaimed pop artists of her generation, with numerous hit albums and singles to her name, including 'Love Story', 'Shake It Off', and 'Blank Space'. Swift's music often deals with themes of love, heartbreak, and personal growth, and she is known for her catchy melodies, relatable lyrics, and powerful vocals. In addition to her music career, Swift is also a successful actress and has appeared in several films and television shows. She is also known for her activism and philanthropic work, particularly in the areas of education, disaster relief, and LGBTQ+ rights.",
    "TaylorSwift"),
  ]);
}

async function createAlbums() {
  console.log("Adding Albums");
  await Promise.all([
    albumCreate(
      "evermore",
      artists[4],
      "evermore",
      2020,
      [genres[1]]
    ),
    albumCreate(
      "Bangerz",
      artists[0], 
      "Bangerz",
      2013,
      [genres[1]]
    ),
    albumCreate(
      "Meteora", 
      artists[1],
      'Meteora',
      2003,
      [genres[0]]
    ),
    albumCreate(
      "Certified Lover Boy", 
      artists[2], 
      "CLB", 
      2021,
      [genres[2]]
    ),
    albumCreate(
      "St. Anger", 
      artists[3], 
      "StAnger",
      2003,
      [genres[3]]
    ),
  ]);
}


async function createSongs() {
  console.log("Adding Songs");
  await Promise.all([
    songCreate(
      "willow", 
      artists[4], 
      albums[0], 
      1,
      214000, 
      [genres[1]]
    ), 
    songCreate(
      "champagne problems", 
      artists[4], 
      albums[0], 
      2,
      244000, 
      [genres[1]]
    ), 
    songCreate(
      "We Can't Stop", 
      artists[0], 
      albums[1],
      2,
      231000, 
      [genres[1]]
    ), 
    songCreate(
      "Wrecking Ball", 
      artists[0], 
      albums[1], 
      6,
      221000, 
      [genres[1]]
    ), 
    songCreate(
      "Faint", 
      artists[1], 
      albums[2], 
      7,
      162000, 
      [genres[0]]
    ), 
    songCreate(
      "Figure.09", 
      artists[1], 
      albums[2], 
      8,
      197000, 
      [genres[0]]
    ), 
    songCreate(
      "TSU", 
      artists[2], 
      albums[3], 
      8,
      308000, 
      [genres[2]]
    ), 
    songCreate(
      "The Remorse", 
      artists[2], 
      albums[3], 
      21,
      351000, 
      [genres[2]]
    ), 
    songCreate(
      "Purify", 
      artists[3], 
      albums[4], 
      10,
      313000, 
      [genres[3]]
    ), 
    songCreate(
      "Frantic", 
      artists[3], 
      albums[4], 
      1,
      350000 , 
      [genres[3]]
    ), 
  ])
}


async function createStatuses() {
  console.log("Adding statuses");
  await Promise.all([
    statusCreate(artists[0], 83678669, 20207945),
    statusCreate(artists[1], 35157417, 23039089),
    statusCreate(artists[2], 68044487, 73571749),
    statusCreate(artists[3], 25335881, 24245602),
    statusCreate(artists[4], 83870715, 70928899),
  ]);
}