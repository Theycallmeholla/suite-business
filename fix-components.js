const fs = require('fs');

// Fix SpecializationPicker
let spec = fs.readFileSync('components/enhanced/SpecializationPicker.tsx', 'utf8');
spec = spec.replace(/import.*scroll-area.*\n/, '');
spec = spec.replace(/import.*collapsible.*\n/, '');
spec = spec.replace(/<ScrollArea[^>]*>/g, '<div className="h-[300px] overflow-y-auto">');
spec = spec.replace(/<\/ScrollArea>/g, '</div>');
spec = spec.replace(/<Collapsible>/g, '<details className="border rounded-lg p-4">');
spec = spec.replace(/<\/Collapsible>/g, '</details>');
spec = spec.replace(/<CollapsibleTrigger[^>]*>(.*?)<\/CollapsibleTrigger>/g, '<summary className="cursor-pointer font-medium">$1</summary>');
spec = spec.replace(/<CollapsibleContent>(.*?)<\/CollapsibleContent>/gs, '<div className="mt-4">$1</div>');
fs.writeFileSync('components/enhanced/SpecializationPicker.tsx', spec);

// Fix page
let page = fs.readFileSync('app/app/dashboard/sites/create-enhanced/page.tsx', 'utf8');
page = page.replace(/import.*use-toast.*\n/, '');
page = page.replace(/const { toast } = useToast\(\)/, 'const toast = { toast: (x) => alert(x.title + ": " + x.description) }');
fs.writeFileSync('app/app/dashboard/sites/create-enhanced/page.tsx', page);
