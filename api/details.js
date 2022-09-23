import Places from 'google-places-web';

Places.apiKey = process.env.REACT_APP_MAPS_KEY;

export default async function details(request, response) {
  const details = await Places.details(request.body);

  response.status(200).json({
    body: details
  });
}

