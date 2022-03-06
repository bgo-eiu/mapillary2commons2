This is intended to be an update to the Mapillary2Commons2 that can interface with Mapillary's new API. It is not live at the moment.

A pending issue at the moment is that unfortunately the new Mapillary API still does not provide support for querying the username of the image contributor, which is important considering the attribution-share alike license of the images. It may be possible to attain this information by scraping the frontend website, but I have not tried this yet due to time limitations.

# Mapillary2Commons (Old Readme)

Tool for uploading images from [Mapillary](https://www.mapillary.com/) to [Wikimedia Commons](https://commons.wikimedia.org/).

Alive at [Tool Labs](https://tools.wmflabs.org/mapillary-commons/mapillary2commons/).

## URL API

Mapillary2Commons allows you to link and initiate the uploading process by appending the `mapillary` URL parameter followed by a Mapillay image key or its full URL:

 - `?mapillary=e814RJRxf8cnqn4OEFFMnQ`
 - `?mapillary=https://www.mapillary.com/map/im/Pcf-Yomz9ST-YEZC4wy0xw`
