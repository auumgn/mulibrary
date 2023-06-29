export function normalizeName(name: string) {
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
