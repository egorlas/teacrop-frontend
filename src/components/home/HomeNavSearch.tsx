import { Suspense } from "react";
import { SearchBar } from "@/components/home/SearchBar";
import { Container } from "@/components/Container";
import Link from "next/link";
import { Menu } from "lucide-react";
import { navMenuItems } from "@/components/home/data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HomeNavSearch() {
  return (
    <div className="bg-white">
      <Container>
        <div className="border-b border-gray-200 py-3">
          <div className="flex items-start gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  aria-label="Danh mục"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navMenuItems.map((item) => (
                  <DropdownMenuItem key={item} asChild className="cursor-pointer">
                    <Link href="#" className="w-full">
                      {item}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="min-w-0 flex-1">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

