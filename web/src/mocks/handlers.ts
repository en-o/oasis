import { http, HttpResponse } from 'msw';
import { db } from './db';

export const handlers = [
  // nav
  http.get('/api/nav', () => HttpResponse.json(db.nav.getAll())),
  http.post('/api/nav', async ({ request }) => {
    const body = await request.json();
    const newNav = db.nav.create({ ...(body as any), id: Date.now() });
    return HttpResponse.json(newNav);
  }),
  http.patch('/api/nav/:id', async ({ params, request }) => {
    const body = await request.json();
    db.nav.update({ where: { id: { equals: Number(params.id) } }, data: body as any });
    return HttpResponse.json(db.nav.findFirst({ where: { id: { equals: Number(params.id) } } }));
  }),
  http.delete('/api/nav/:id', ({ params }) => {
    db.nav.delete({ where: { id: { equals: Number(params.id) } } });
    return HttpResponse.json({ success: true });
  }),

  // categories
  http.get('/api/categories', () => HttpResponse.json(db.category.getAll().map((c) => c.name))),
  http.post('/api/categories', async ({ request }) => {
    const { name } = (await request.json()) as { name: string };
    const newCat = db.category.create({ id: Date.now(), name });
    return HttpResponse.json(newCat.name);
  }),
  http.patch('/api/categories/:index', async ({ params, request }) => {
    const { name } = (await request.json()) as { name: string };
    const idx = Number(params.index);
    const cats = db.category.getAll();
    db.category.update({ where: { id: { equals: cats[idx].id } }, data: { name } });
    return HttpResponse.json(name);
  }),
  http.delete('/api/categories/:index', ({ params }) => {
    const idx = Number(params.index);
    const cats = db.category.getAll();
    db.category.delete({ where: { id: { equals: cats[idx].id } } });
    return HttpResponse.json({ success: true });
  }),

  // system
  http.get('/api/system', () =>
    HttpResponse.json(db.system.findFirst({ where: { id: { equals: 'singleton' } } }))
  ),
  http.patch('/api/system', async ({ request }) => {
    const body = await request.json();
    const updated = db.system.update({
      where: { id: { equals: 'singleton' } },
      data: body as any,
    });
    return HttpResponse.json(updated);
  }),
];