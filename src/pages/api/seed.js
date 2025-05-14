import { getCollection } from '../../lib/db';

const initialMenuItems = [
  { name: 'بروشيتا', price: '8$', description: 'خبز محمص مع الطماطم والثوم والريحان الطازج' },
  { name: 'كلاماري', price: '12$', description: 'كلاماري مقلي مقرمش مع صلصة المارينارا' },
  { name: 'سلطة كابريزي', price: '10$', description: 'موزاريلا طازجة مع الطماطم والريحان وصلصة البالساميك' },
  { name: 'سلمون مشوي', price: '24$', description: 'فيليه سلمون طازج مع صلصة الليمون والزبدة والخضروات الموسمية' },
  { name: 'لحم البقر', price: '28$', description: 'لحم بقري 8 أونصات مع صلصة النبيذ الأحمر والبطاطس المهروسة' },
  { name: 'ريزوتو الخضار', price: '18$', description: 'أرز كريمي مع الخضروات الموسمية والبارميزان' },
  { name: 'تيراميسو', price: '8$', description: 'حلوى إيطالية كلاسيكية مع بسكويت ليدي فينغر مغموس في القهوة وكريمة الماسكاربوني' },
  { name: 'كيك الشوكولاتة', price: '9$', description: 'كيك شوكولاتة دافئ مع مركز ذائب، يقدم مع آيس كريم الفانيليا' },
  { name: 'كريم برولي', price: '8$', description: 'كريم فانيليا فرنسي كلاسيكي مع طبقة سكر محمصة' },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const collection = await getCollection('menu_items');
    
    // حذف البيانات الموجودة
    await collection.deleteMany({});
    
    // إضافة البيانات الجديدة
    const result = await collection.insertMany(initialMenuItems);
    
    res.status(200).json({ 
      message: 'تم إضافة البيانات بنجاح',
      count: result.insertedCount 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إضافة البيانات',
      details: error.message 
    });
  }
} 