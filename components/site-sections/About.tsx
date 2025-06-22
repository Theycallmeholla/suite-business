'use client';

import { AboutSection } from '@/types/site-builder';
import { EditableText } from '@/components/EditableText';

interface AboutProps {
  section: AboutSection;
  siteData: {
    businessName: string;
    primaryColor: string;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}

export function About({ section, siteData, onUpdate, isEditable = false }: AboutProps) {
  const { data } = section;

  if (data.variant === 'simple') {
    return (
      <section className="py-16 md:py-24 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {isEditable ? (
              <EditableText
                value={data.title}
                onSave={(value: string) => onUpdate?.('title', value)}
                as="h2"
                className="text-3xl md:text-4xl font-bold mb-6"
                editClassName="text-3xl md:text-4xl font-bold text-gray-900"
                placeholder="About Us"
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.title}</h2>
            )}
            {isEditable ? (
              <EditableText
                value={data.content}
                onSave={(value: string) => onUpdate?.('content', value)}
                className="prose prose-lg mx-auto text-gray-600"
                editClassName="prose prose-lg mx-auto text-gray-900"
                placeholder="Tell your story..."
                multiline
                richText
              />
            ) : (
              <div 
                className="prose prose-lg mx-auto text-gray-600"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (data.variant === 'with-image') {
    return (
      <section className="py-16 md:py-24" id="about">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {isEditable ? (
                <EditableText
                  value={data.title}
                  onSave={(value: string) => onUpdate?.('title', value)}
                  as="h2"
                  className="text-3xl md:text-4xl font-bold mb-6"
                  editClassName="text-3xl md:text-4xl font-bold text-gray-900"
                  placeholder="About Us"
                />
              ) : (
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.title}</h2>
              )}
              {isEditable ? (
                <EditableText
                  value={data.content}
                  onSave={(value: string) => onUpdate?.('content', value)}
                  className="prose prose-lg text-gray-600"
                  editClassName="prose prose-lg text-gray-900"
                  placeholder="Tell your story..."
                  multiline
                  richText
                />
              ) : (
                <div 
                  className="prose prose-lg text-gray-600"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              )}
            </div>
            {data.image && (
              <div className="relative">
                <img
                  src={data.image}
                  alt={`About ${siteData.businessName}`}
                  className="rounded-lg shadow-lg w-full"
                />
                <div 
                  className="absolute -bottom-4 -right-4 w-full h-full rounded-lg -z-10"
                  style={{ backgroundColor: `${siteData.primaryColor}20` }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (data.variant === 'with-stats') {
    return (
      <section className="py-16 md:py-24 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {isEditable ? (
              <EditableText
                value={data.title}
                onSave={(value: string) => onUpdate?.('title', value)}
                as="h2"
                className="text-3xl md:text-4xl font-bold mb-6"
                editClassName="text-3xl md:text-4xl font-bold text-gray-900"
                placeholder="About Us"
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.title}</h2>
            )}
            {isEditable ? (
              <EditableText
                value={data.content}
                onSave={(value: string) => onUpdate?.('content', value)}
                className="prose prose-lg mx-auto text-gray-600 max-w-3xl"
                editClassName="prose prose-lg mx-auto text-gray-900 max-w-3xl"
                placeholder="Tell your story..."
                multiline
                richText
              />
            ) : (
              <div 
                className="prose prose-lg mx-auto text-gray-600 max-w-3xl"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
          </div>
          
          {data.stats && data.stats.length > 0 && (
            <div className={`grid grid-cols-2 md:grid-cols-${data.stats.length} gap-8 mt-12 max-w-4xl mx-auto`}>
              {data.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: siteData.primaryColor }}
                  >
                    {isEditable ? (
                      <EditableText
                        value={stat.value}
                        onSave={(value: string) => onUpdate?.(`stats.${idx}.value`, value)}
                        placeholder="0"
                        editClassName="text-4xl md:text-5xl font-bold text-gray-900"
                      />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-gray-600">
                    {isEditable ? (
                      <EditableText
                        value={stat.label}
                        onSave={(value: string) => onUpdate?.(`stats.${idx}.label`, value)}
                        placeholder="Label"
                        editClassName="text-gray-600"
                      />
                    ) : (
                      stat.label
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
}