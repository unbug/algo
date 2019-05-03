import { searchParams } from '../utils/Param';
const searchPars = searchParams();

const Config = {
  appName: 'algo',
  debug: searchPars['debug']
};

export default Config;
