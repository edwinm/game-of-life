void reverse(int* p, int len) {
    for (int i = 0; i < len / 2; ++i) {
        int temp = p[i];
        p[i] = p[len - i - 1];
        p[len - i - 1] = temp;
    }
}
