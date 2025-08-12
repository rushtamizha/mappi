import { Link } from "../models/Link.js";
import { User } from "../models/User.js";

export const addLink = async (req, res) => {
  try {
    const { title, url, logo, description } = req.body;
    const userId = req.user._id;
   
    const lastLink = await Link.findOne({ userId : userId }).sort('-order');
    const nextOrder = lastLink ? lastLink.order + 1 : 1;
  
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    let logoUrl = logo;

   /* if (req.file) {
      logoUrl = req.file.path;
    }

  if (!logoUrl) {
 return res.status(400).json({ error: "Logo image is required" });
  }
*/
    const newLink = new Link({
      title,
      url,
      logo: logoUrl,
      description,
      userId,
      order:nextOrder,
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    console.error("Add link failed:", err.message, err.stack);
    res.status(500).json({ error: "Server error" });
  }
};


// Update a link
export const updateLink = async (req, res) => {
  try {
    const linkId = req.params.id;
    const updated = await Link.findByIdAndUpdate(linkId, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Link not found" });
    res.json({ message: "Link updated successfully", link: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a link
export const deleteLink = async (req, res) => {

  try{
  const userId = req.user.id || req.user.userId

  //1.link deleting
  await Link.findByIdAndDelete(req.params.id);
  //2.link re indexing 
  const links = await Link.find({userId:userId}).sort({order:1});
  // 3. Reassign order from 1...n
    for (let i = 0; i < links.length; i++) {
      links[i].order = i + 1;
      await links[i].save(); // or use bulkWrite for better performance
    }
  res.json({ message: "Link deleted" });
  }
  catch (error){
    res.status(500).json({ error: "Server error" });
  }
};

// Get all visible links for a user
export const getUserLinks = async (req, res) => {
  try {
    const userId = req.params.id

    if (!userId) return res.status(400).json({ message: 'User ID missing' });

    const links = await Link.find({ userId:userId }).sort({ order: 1 });

    res.json({ links });
  } catch (error) {
    console.error('Error fetching user links:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle visibility
export const toggleVisibility = async (req, res) => {
  const link = await Link.findById(req.params.id);
  if (!link) return res.status(404).json({ error: "Link not found" });
  link.visible = !link.visible;
  await link.save();
  res.json({ message: `Link is now ${link.visible ? "visible" : "hidden"}` });
};

// Log a click with plan-based monthly limit
export const logClick = async (req, res) => {
  const link = await Link.findById(req.params.id);
  if (!link) return res.status(404).json({ error: "Link not found" });
  const user = await User.findById(link.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const userLinks = await Link.find({ userId: user._id });
  let monthlyClicks = 0;
  userLinks.forEach(l => {
    monthlyClicks += l.clickLogs.filter(d => d >= monthStart).length;
  });

  const plan = user.plan || "free";
  const planLimits = {
    free: Infinity,
    pro: Infinity,
    premium: Infinity
  };

  if (monthlyClicks >= planLimits[plan]) {
    return res.status(429).json({ error: "Monthly click limit reached for your plan." });
  }

  link.clicks += 1;
  link.clickLogs.push(now);
  await link.save();
  res.json({ message: "Click logged" });
};

// Stats: Today, Yesterday, Week, Month, Year (with 12hr time logs)
export const getUserStats = async (req, res) => {
  const userId = req.user.id;
  const links = await Link.find({ userId });

  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
  const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

  const stats = links.map(link => {
    const clicksToday = link.clickLogs.filter(d => d >= today).length;
    const clicksYesterday = link.clickLogs.filter(d => d >= yesterday && d < today).length;
    const clicksWeek = link.clickLogs.filter(d => d >= weekAgo).length;
    const clicksMonth = link.clickLogs.filter(d => d >= monthAgo).length;
    const clicksYear = link.clickLogs.filter(d => d >= yearAgo).length;

    const clickTimestamps = link.clickLogs.map(d => ({
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: d.toLocaleDateString('en-IN')
    }));

    return {
      linkId: link._id,
      title: link.title,
      totalClicks: link.clicks,
      clicksToday,
      clicksYesterday,
      clicksWeek,
      clicksMonth,
      clicksYear,
      clickTimestamps
    };
  });

  stats.sort((a, b) => b.totalClicks - a.totalClicks);
  res.json(stats);
};

export const getLinksByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      username: { $regex: `^${username}$`, $options: "i" }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const links = await Link.find({ userId: user._id, visible: true }).sort({ order: 1 });
    res.json({ links, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const updateLinkOrder = async (req, res) => {
  try {
    const userId = req.user.id?.toString() || req.user._id?.toString();
    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "links must be an array" });
    }

    const bulkOps = links.map((link) => {
      console.log("Trying to update:", {
        _id: link._id,
        userId: userId,
        newOrder: link.order,
      });

      return {
        updateOne: {
          filter: { _id: link._id, userId }, // suspect line
          update: { $set: { order: link.order } },
        },
      };
    });

    const result = await Link.bulkWrite(bulkOps);

    console.log("BulkWrite result:", result);
    res.json({ message: "Order updated successfully", result });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: error.message });
  }
};
