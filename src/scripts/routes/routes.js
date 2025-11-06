import HomePage from '../pages/home/home-page';
import RegisterPage from '../auth/register-page';
import LoginPage from '../auth/login-page';
import AddPage from '../pages/add/add-page';
import DetailPage from '../pages/detail/detail-page';
import FavoritePage from '../pages/favorite/favorite-page';
import MapPage from '../pages/map/map-page';

const routes = {
  '/': HomePage,
  '/register': RegisterPage,
  '/login': LoginPage,
  '/add': AddPage,
  '/detail/:id': DetailPage,
  '/favorite': FavoritePage,
  '/map': MapPage,
};

export default routes;
