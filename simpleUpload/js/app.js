var m2c = {
  mapillaryKey: 'MLY|4883184538440543|8bb1f75d4864b7a7721323ad75f08c8f',
  mapillaryEndpoint: 'https://graph.mapillary.com/',
  mapillaryImageEndpoint: 'https://scontent-iad3-2.xx.fbcdn.net/m1/v/t6/',
  mapillaryEmbedEndpoint: 'https://www.mapillary.com/embed?map_style=OpenStreetMap&image_key=',
  urlToCommonsEndpoint: 'https://tools.wmflabs.org/url2commons/index.html?run=1',
  commonsEndpoint: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&utf8=1&formatversion=2&origin=*',
  commonsFileEndpoint: 'https://commons.wikimedia.org/wiki/',
  imageData: undefined,

  mapillaryInCommons: function(id, callback) {
    var url = m2c.commonsEndpoint + '&list=search&srsearch=' + id + '&srnamespace=6&srlimit=1&srinfo=&srprop=';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var response = JSON.parse(xhr.responseText);
        if (typeof callback == 'function') {
          if (response.query.search.length > 0) {
            // if the first commons result does not have the image key in its filename it's a false positive
            if (response.query.search[0].title.indexOf(id.replace(/_/g , ' ')) !== -1) {
              callback.apply(null, [response.query.search[0].title]);
            } else {
              callback.apply(null, [false]);
            }
          } else {
            callback.apply(null, [false]);
          }
        }
      } else {
        return;
      }
    };
    xhr.send();
  },

  getMapillaryFromURL: function() {
    var url = window.location.search.substring(1);
    var vars = url.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0].toLowerCase() == 'mapillary') {
        return pair[1];
      }
    }
    return false;
  },

  getParameterByName: function(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  mapillaryURLtoID: function(url) {
    if (typeof url == 'string') {
      if (url.match(/\/\/www\.mapillary\.com\/app\//gi)) {
        return getParameterByName('pKey', url);
      } else {
        return url;
      }
    } else {
      return false;
    }
  },

  getMapillaryData: function(id, callback) {
    var url = m2c.mapillaryEndpoint + id + '?access_token=' + m2c.mapillaryKey + '&fields=thumb_original_url,computed_geometry,captured_at,computed_compass_angle';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var response = JSON.parse(xhr.responseText);
        if (typeof callback == 'function') {
          if (xhr.status === 404) {
            callback.apply(null, [false]);
          } else {
            m2c.imageData = response;
            callback.apply(null, [response]);
          }
        }
      } else {
        return;
      }
    };
    xhr.send();
  },

  constructURL: function(location, filename) {
    var date = new Date(m2c.imageData.captured_at).toISOString().replace(/T/g, ' ').replace(/.000Z/g, '');
    var imageUrl = m2c.imageData.thumb_original_url;

    var uploadDescription = '{{subst:Mapillary' +
      '|location=' + location +
      '|key=' + m2c.imageData.id +
      '|date=' + date +
      '|lat=' + m2c.imageData.computed_geometry.coordinates[1] +
      '|lon=' + m2c.imageData.computed_geometry.coordinates[0] +
      '}}';

    var url = m2c.urlToCommonsEndpoint +
      '&urls=' +
      encodeURIComponent(imageUrl).replace(/_/g, '$US$') +
      ' ' + filename + '|' +
      encodeURIComponent(uploadDescription).replace( /_/g , "$US$" ) +
      '&desc=$DESCRIPTOR$';

    document.getElementById('upload').href = url;
  },

  constructFilename: function(location, id) {
    // expect location to be more then 3 charters long
    if (location.length > 3) {
      var destFile = location + ' - Mapillary (' + id + ').jpg';
      document.getElementById('filename-label').innerText = destFile;
      m2c.constructURL(location, destFile);
    } else {
      document.getElementById('upload').href = '';
      document.getElementById('filename-label').innerText = 'Enter a location description before uploading.';
    }
  },

  loadMapillaryImage: function(id, callback) {
    var url = m2c.imageData.thumb_original_url;
    var img = new Image();
    img.onload = callback.apply(null, [url]);
    img.src = url;
  },

  openNotification: function(text) {
    var container = document.getElementById('notification');
    container.innerHTML = text;
    container.style.display = 'inline';

    window.setTimeout(function() {
      container.style.display = 'none';
    }, 6000);
  }
}

var id = m2c.mapillaryURLtoID(m2c.getMapillaryFromURL());

if (id) {
  processImageID(id);
} else {
  var btn = document.getElementById('mapillary-submit');
  var input = document.getElementById('mapillary-input');
  input.style.display = 'inline-block';
  btn.style.display = 'inline-block';

  btn.addEventListener('click', function(evt) {
    id = m2c.mapillaryURLtoID(input.value);
    processImageID(id);
  });
}

document.getElementById('location-input').addEventListener('input', function(evt) {
  m2c.constructFilename(this.value, id);
});

document.getElementById('upload').addEventListener('click', function(evt) {
  if (evt.target.href === window.location.href) {
    evt.preventDefault();
  }
});
//372382704255691&style=photo
function processImageID(id) {
  m2c.getMapillaryData(id, function(data) {
    if (data) {
      m2c.mapillaryInCommons(id, function(commons) {
        if (commons) {
          m2c.openNotification('This image seems to exist in Commons: <a href="' + m2c.commonsFileEndpoint + commons + '">' + commons + '</a>');
        } else {
          m2c.loadMapillaryImage(id, function(url) {
            if (typeof url === 'string') {
              document.getElementById('embed').src = m2c.mapillaryEmbedEndpoint + id + '&style=photo';
              document.getElementById('main').style.display = 'flex';
              window.scrollTo(0, document.body.scrollHeight);
            }
          });
        }
      });
    } else {
      m2c.openNotification('Could not find the requested image at Mapillary.');
    }
  });
}
