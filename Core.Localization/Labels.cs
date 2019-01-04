using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Serialization;

namespace Core.Localization
{
    [Serializable]
    public class Labels
    {    
        public List<LabelItem> Items { get; set; }

        public bool Contains(string key)
        {
            return Items.Any(x => x.Key.Equals(key));
        }

        public LabelItem this[string key]
        {
            get
            {
                return Items.Single(x => x.Key.Equals(key));
            }
        }
    }

    [Serializable]
    public class LabelItem
    {
        public string Key { get; set; }
        public string English { get; set; }
        public string French { get; set; }

        public string this[int lcid]
        {
            get
            {
                if (lcid == 1036) return French;
                else return English;
            }
        }
    }

    public class LabelFactory
    {
        public Labels BuildFromConfig(string config)
        {
            var serializer = new XmlSerializer(typeof(Labels));
            using (var reader = new StringReader(config))
            {
                return serializer.Deserialize(reader) as Labels;
            }
        }
    }
}
