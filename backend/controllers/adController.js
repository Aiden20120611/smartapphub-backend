const { readData, writeData } = require('../utils/dataManager');
const { saveFile, deleteFile } = require('../utils/fileManager');

// 创建广告
const createAd = async (req, res) => {
  try {
    const { type, title, link, position, order, startTime, endTime } = req.body;
    const { file } = req;
    
    if (!type || !title || !position) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证广告类型
    const validTypes = ['image', 'video', 'web'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: '无效的广告类型' });
    }
    
    // 验证广告位置
    const validPositions = ['home', 'category', 'detail'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({ error: '无效的广告位置' });
    }
    
    // 处理文件上传
    let mediaUrl = null;
    if (file && (type === 'image' || type === 'video')) {
      const savedFile = await saveFile(file, 'ads');
      mediaUrl = savedFile.url;
    }
    
    // 读取现有广告数据
    const ads = await readData('ads.json');
    
    // 创建新广告
    const newAd = {
      id: String(ads.length + 1),
      type,
      title,
      link,
      mediaUrl,
      position,
      order: parseInt(order) || ads.length + 1,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    ads.push(newAd);
    await writeData('ads.json', ads);
    
    res.json({
      success: true,
      message: '广告创建成功',
      ad: newAd
    });
  } catch (error) {
    console.error('创建广告失败:', error);
    res.status(500).json({ error: '创建失败，请重试' });
  }
};

// 更新广告
const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { file } = req;
    
    // 读取现有广告数据
    const ads = await readData('ads.json');
    const adIndex = ads.findIndex(ad => ad.id === id);
    
    if (adIndex === -1) {
      return res.status(404).json({ error: '广告不存在' });
    }
    
    // 处理文件上传
    if (file && (updateData.type === 'image' || updateData.type === 'video')) {
      const savedFile = await saveFile(file, 'ads');
      updateData.mediaUrl = savedFile.url;
    }
    
    // 更新广告信息
    ads[adIndex] = {
      ...ads[adIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await writeData('ads.json', ads);
    
    res.json({
      success: true,
      message: '广告更新成功',
      ad: ads[adIndex]
    });
  } catch (error) {
    console.error('更新广告失败:', error);
    res.status(500).json({ error: '更新失败，请重试' });
  }
};

// 获取广告列表
const getAdList = async (req, res) => {
  try {
    const ads = await readData('ads.json');
    
    // 按位置和顺序排序
    ads.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position.localeCompare(b.position);
      }
      return (a.order || 0) - (b.order || 0);
    });
    
    res.json(ads);
  } catch (error) {
    console.error('获取广告列表失败:', error);
    res.status(500).json({ error: '获取失败，请重试' });
  }
};

// 获取指定位置的广告
const getAdsByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const ads = await readData('ads.json');
    
    // 过滤指定位置的广告
    const filteredAds = ads.filter(ad => 
      ad.position === position && 
      ad.status === 'active' &&
      (ad.startTime <= new Date().toISOString()) &&
      (!ad.endTime || ad.endTime >= new Date().toISOString())
    );
    
    // 按顺序排序
    filteredAds.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json(filteredAds);
  } catch (error) {
    console.error('获取广告失败:', error);
    res.status(500).json({ error: '获取失败，请重试' });
  }
};

// 删除广告
const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ads = await readData('ads.json');
    const adIndex = ads.findIndex(ad => ad.id === id);
    
    if (adIndex === -1) {
      return res.status(404).json({ error: '广告不存在' });
    }
    
    const ad = ads[adIndex];
    
    // 从广告列表中删除
    ads.splice(adIndex, 1);
    await writeData('ads.json', ads);
    
    res.json({
      success: true,
      message: '广告删除成功'
    });
  } catch (error) {
    console.error('删除广告失败:', error);
    res.status(500).json({ error: '删除失败，请重试' });
  }
};

// 更新广告状态
const updateAdStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }
    
    const ads = await readData('ads.json');
    const adIndex = ads.findIndex(ad => ad.id === id);
    
    if (adIndex === -1) {
      return res.status(404).json({ error: '广告不存在' });
    }
    
    ads[adIndex].status = status;
    ads[adIndex].updatedAt = new Date().toISOString();
    
    await writeData('ads.json', ads);
    
    res.json({
      success: true,
      message: '广告状态更新成功',
      ad: ads[adIndex]
    });
  } catch (error) {
    console.error('更新广告状态失败:', error);
    res.status(500).json({ error: '更新失败，请重试' });
  }
};

module.exports = {
  createAd,
  updateAd,
  getAdList,
  getAdsByPosition,
  deleteAd,
  updateAdStatus
};