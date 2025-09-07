export function normalizeName(name: string | string[]) {
  if (Array.isArray(name)) name = name.join("-");
  return name
    .replace(/\/|:|,|[!@#$%^~+&*?]|\(|\)|\\"/g, " ")
    .replace(/[''"".]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim()
    .toLowerCase();
}
/*

SELECT 
  trim(
                    lower(name),
                    '\/|:|,|[!@#$%^~+&*?]|\(|\)|\\"',
                    ' ',
                    'g'
                  ),
                  '[''"".]',
                  '',
                  'g'
                ),
            '\s+',
            '-',
            'g'
        ),
        '-+',
        '-',
        'g'
      ),
      '(^-|-$)',
      '',
      'g'
    )
  ) AS modified_name, *
FROM 
  "mulibrary"."album";

*/
