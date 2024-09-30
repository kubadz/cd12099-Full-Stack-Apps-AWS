import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';
import {URL} from 'url';
import axios from 'axios'


(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  app.get("/filteredimage", async ( req, res ) => {
    let { image_url } = req.query;
  
    if (!image_url) {
      return res.status(400).send("Missing required image URL");
    }

    try {
      new URL(image_url);
    } catch (err) {
      console.log(err);
      return res.status(422).send("Provided invalid URL");
    }

    if (!image_url.endsWith(".jpg") && !image_url.endsWith(".jpeg")) {
      return res.status(422).send("Provided file is not a JPEG image");
    }

    // Download image via axios and only then pass it to the util function using Jimp, 
    // as Jimp has problems with downloading some jpg images, as described in 
    // https://github.com/jimp-dev/jimp/issues/775. Unfortunately an image example provided
    // in a Project Rubric was one of the problematic images. With this solution in place,
    // it seems to work for all images.
    axios({
        method: 'get',
        url: image_url,
        responseType: 'arraybuffer'
    })
    .then(function ({data: imageBuffer}) {
      filterImageFromURL(imageBuffer).then(function(image){
        res.sendFile(image, function(){deleteLocalFiles([image])});
      });
    });
  })

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();