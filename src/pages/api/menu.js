import { find, insertOne, updateOne, deleteOne } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // الحصول على جميع عناصر القائمة
        const menuItems = await find('menu_items');
        res.status(200).json(menuItems);
        break;

      case 'POST':
        // إضافة عنصر جديد للقائمة
        const newItem = await insertOne('menu_items', req.body);
        res.status(201).json(newItem);
        break;

      case 'PUT':
        // تحديث عنصر في القائمة
        const { id, ...updateData } = req.body;
        const updatedItem = await updateOne('menu_items', { _id: id }, updateData);
        res.status(200).json(updatedItem);
        break;

      case 'DELETE':
        // حذف عنصر من القائمة
        const { id: deleteId } = req.body;
        const deletedItem = await deleteOne('menu_items', { _id: deleteId });
        res.status(200).json(deletedItem);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 