import generalService from "./general.service.js";

export const getTargetDetails = async (req, res) => {
  try {
    const targetDetails = await generalService.getTargetDetails();
    res.json(targetDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

const generalController = {
  getTargetDetails,
};

export default generalController;
