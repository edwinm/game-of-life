#include <stdio.h>
#include <emscripten/emscripten.h>

int main(int argc, char ** argv) {
    printf("main() called\n");
}

void EMSCRIPTEN_KEEPALIVE gof(int argc, char ** argv) {
    printf("GOF Called\n");
}
