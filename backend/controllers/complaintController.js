const mongoose = require("mongoose");

const complaint = async(req, res) => {
    try {
        const { outletSlug, rating, name, email, text } = req.body;
        const outlet = await Outlet.findOne({ slug: outletSlug, isActive: true });
        if (!outlet) return res.status(404).json({ error: "Outlet not found" });
      
        const complaint = await Complaint.create({
          outletId: outlet._id, rating, name, email, text,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    complaint
}