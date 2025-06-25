using Microsoft.AspNetCore.Mvc;

namespace PWA.Areas.Web.Controllers
{
    [Area("Web")]
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult NFC()
        {
            return View();
        }

        public IActionResult QRCODE()
        {
            return View();
        }

        public IActionResult GPS()
        {
            return View();
        }

        public IActionResult ID()
        {
            return View();
        }
    }
}
