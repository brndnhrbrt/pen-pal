import config from "config";

const getTargetDetails = async () => {
  return {
    targetDomain: config.get("TARGET_HOST"),
    targetUrl: config.get("TARGET_URL"),
  };
};

const generalService = {
  getTargetDetails,
};

export default generalService;
