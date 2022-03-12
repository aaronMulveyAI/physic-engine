package com.darkmop.util;

public class ConsoleUtils {
	public static void printPixel(int r, int g, int b) {
		r = r < 0 ? 0 : r > 255 ? 255 : r;
		g = g < 0 ? 0 : g > 255 ? 255 : g;
		b = b < 0 ? 0 : b > 255 ? 255 : b;

		System.out.print("\033[38;2;" + r + ";" + g + ";" + b + "m██\033[0m");
	}
}
