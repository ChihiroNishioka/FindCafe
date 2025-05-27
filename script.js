let map;
let service;
let currentLocation;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', () => {
        const query = document.getElementById('locationInput').value;
        if (query) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: query }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const loc = results[0].geometry.location;
                    map.setCenter(loc);
                    searchCafes(loc);
                } else {
                    alert('場所を見つけられませんでした。');
                }
            });
        }
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 15,
    });
    service = new google.maps.places.PlacesService(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                map.setCenter(currentLocation);
                searchCafes(currentLocation);
            },
            () => {
                console.warn('Geolocation failed.');
            }
        );
    }
}

function searchCafes(location) {
    const request = {
        location: location,
        radius: 400,
        type: ['cafe'],
    };
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            displayResults(results.slice(0, 5));
        } else {
            console.error('Places search failed:', status);
        }
    });
}

function displayResults(places) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    places.forEach((place) => {
        const container = document.createElement('div');
        container.className = 'place';
        const title = document.createElement('h3');
        title.textContent = place.name + (place.rating ? ` (★${place.rating})` : '');
        container.appendChild(title);

        service.getDetails(
            {
                placeId: place.place_id,
                fields: ['website', 'url', 'geometry', 'rating', 'user_ratings_total'],
            },
            (details, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    if (details.website) {
                        const link = document.createElement('a');
                        link.href = details.website;
                        link.target = '_blank';
                        link.textContent = '公式サイト';
                        container.appendChild(link);
                    }
                    const recommend = document.createElement('p');
                    if (details.rating) {
                        recommend.textContent = `おすすめポイント: 評価 ${details.rating} (${details.user_ratings_total}件)`;
                    } else {
                        recommend.textContent = 'おすすめポイント: 評判が高いカフェ';
                    }
                    container.appendChild(recommend);

                    const navBtn = document.createElement('button');
                    navBtn.textContent = 'このお店に案内';
                    navBtn.addEventListener('click', () => {
                        const dest = details.geometry && details.geometry.location;
                        if (dest) {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat()},${dest.lng()}&travelmode=walking`;
                            window.open(url, '_blank');
                        }
                    });
                    container.appendChild(navBtn);
                }
            }
        );

        resultsDiv.appendChild(container);
    });
}
