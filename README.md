# storage-api

storage-api is built on node v12.6.0

# Docker Documentation
Docker will work with the command 
```
docker-compose up
```
The api will be listening on the root of localhost under port 8080

# Route Documentation
A [openapi specification] is included in the repository.


# Postman
A [postman collection] has been included for testing the server.
### Upload File Route
When uploading a file, navigate to the "Upload File" post.  Navigate to the "Body" tab and select a file for the uploadedFile key.  Click the send button. Copy the response.  This is the id for the file.

### Get File Route
To download the file you just uploaded, edit the route and paste in the id you just copied.  Click the send button.

### Get Files Route
To get all the files back, there is no editing that needs to be done.  Clicking send will retrieve a list.  Pagination is supported by adding query parameters for page and pageSize.  Page starts at 0.  Maximum pageSize is 100.  If no query parameters are included, page defaults to 0 and pageSize defaults to 20.  nextPage is part of the response and can be directly plugged into the next request.  pageSize is also part of the response in case you supply an invalid pageSize.

### Delete File Route
To delete your file, edit the route and paste in the id you just copied. Click the send button.



[postman collection]: <https://github.com/oconnecp/storage-api/raw/master/storage-api.postman_collection.json>
[openapi specification]: <https://github.com/oconnecp/storage-api/raw/master/openapi.yaml>
