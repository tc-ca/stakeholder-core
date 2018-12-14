using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TcDirectory.Models
{
    public class ClientResults
    {
        public string odatacontext { get; set; }
        public Client[] value { get; set; }
    }
}
