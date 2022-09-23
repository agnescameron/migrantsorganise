import Places from 'google-places-web';

Places.apiKey = process.env.REACT_APP_MAPS_KEY;

export default async function autocomplete(request, response) {
const search = await Places.autocomplete(request.body);
  response.status(200).json({
    body: search,
  });
}