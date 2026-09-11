insert into public.categories (slug, name, description, icon)
values
  ('aire', 'Aire', 'Malos Olores, Gases, Humo, Polvo, Partículas.', 'Wind'),
  ('ruido', 'Ruido', 'Ruido.', 'Volume2'),
  ('suelo', 'Suelo', 'Basura, Vibraciones.', 'Sprout'),
  ('agua', 'Agua', 'Aguas Negras, Falta de Drenajes, Desechos en el Agua, Coloración en cuerpos de agua.', 'Waves'),
  ('visual', 'Visual', 'Rótulos, Pantallas, Chatarra.', 'Eye'),
  ('otros', 'Otros', 'Otros.', 'CircleEllipsis')
on conflict (slug) do nothing;
