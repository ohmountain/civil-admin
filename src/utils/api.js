export const CREATE_PLACE_API = {
    url: 'http://localhost:8000/place',
    method: 'post'
};

export const GET_PLACE_API = {
    url: 'http://localhost:8000/place',
    method: 'get'
};

export const GET_ALL_PLACES_API = {
    url: 'http://localhost:8000/places/all',
};

export const PAGINATION_PLACE_API = {
    url: 'http://localhost:8000/places',
    method: 'get'
};

export const ADD_PLACE_RESOURCE_API = {
    url: 'http://localhost:8000/place/resource',
    method: 'post'
};

export const GET_PLACE_RESOURCES_API = {
    url: 'http://localhost:8000/place/resources',
    method: 'get'
};

export const CREATE_UNIT_API = {
    url: 'http://localhost:8000/unit',
    method: 'post'
};

export const UPDATE_UNIT_API = {
    url: 'http://localhost:8000/unit/update',
    method: 'post'
};

export const PAGINATION_UNIT_API = {
    url: 'http://localhost:8000/units',
    method: 'get'
};

export const GET_ALL_UNIT_API = {
    url: 'http://localhost:8000/units/all',
    method: 'get'
};

export const PAGINATION_ROUTES_API = {
    url: 'http://localhost:8000/routes',
    method: 'get'
};

export const GET_ALL_ROUTES_WITH_PLACE_API = {
    url: 'http://localhost:8000/routes/place',
    method: 'get'
};

export const CREATE_ROUTE_API = {
    url: 'http://localhost:8000/route',
    method: 'post'
};

export const PAGINATION_VEHICLE_API = {
    url: 'http://localhost:8000/vehicles',
    method: 'get'
};

export const CREATE_VEHICLE_API = {
    url: 'http://localhost:8000/vehicle',
    method: 'post'
};

export const UPDATE_VEHICLE_API = {
    url: 'http://localhost:8000/vehicle/update',
    method: 'post'
};

export const GET_ALL_VEHICLES_API = {
    url: 'http://localhost:8000/vehicles/all',
    method: 'get'
};

export const CREATE_EVACUATION_API = {
    url: 'http://localhost:8000/evacuation',
    method: 'post'
};

export const PAGINATION_EVACUATION_API = {
    url: 'http://localhost:8000/evacuations',
    method: 'get'
};

export const GET_EVACUATION_RESOURCES_API = {
    url: 'http://localhost:8000/evacuation/resources',
    method: 'get'
};

function request(url, data = {}, method = 'get') {

    let options = {
        method,
        // mode: 'cors',
        // credentials: 'omit',
        cache: 'no-store'
    };


    if (method.toLocaleUpperCase() != 'GET') {
        let form = new FormData();

        for (let key in data) {
            form.append(key, data[key]);
        }

        options.body = form;
    }

    let request = new Request(url, options);

    return fetch(request);
}

export function GET(url) {
    return request(url, 'get');
}

export function POST(url, data = {}){
    return request(url, data, 'post');
}

export function PUT(url, data = {}) {
    return request(url, data, 'put');
};
