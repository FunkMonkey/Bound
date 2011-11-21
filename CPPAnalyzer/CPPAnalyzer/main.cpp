#include <clang-c/index.h>
#include <iostream>

#include <string>

static void PrintExtent(FILE *out, unsigned begin_line, unsigned begin_column,
						unsigned end_line, unsigned end_column) {
							fprintf(out, "[%d:%d - %d:%d]", begin_line, begin_column,
								end_line, end_column);
}

static void PrintRange(CXSourceRange R, const char *str) {
	CXFile begin_file, end_file;
	unsigned begin_line, begin_column, end_line, end_column;

	clang_getSpellingLocation(clang_getRangeStart(R),
		&begin_file, &begin_line, &begin_column, 0);
	clang_getSpellingLocation(clang_getRangeEnd(R),
		&end_file, &end_line, &end_column, 0);
	if (!begin_file || !end_file)
		return;

	printf(" %s=", str);
	PrintExtent(stdout, begin_line, begin_column, end_line, end_column);
}

int want_display_name = 0;
static void PrintCursor(CXCursor Cursor) {
	CXTranslationUnit TU = clang_Cursor_getTranslationUnit(Cursor);
	if (clang_isInvalid(Cursor.kind)) {
		CXString ks = clang_getCursorKindSpelling(Cursor.kind);
		printf("Invalid Cursor => %s", clang_getCString(ks));
		clang_disposeString(ks);
	}
	else {
		CXString string, ks;
		CXCursor Referenced;
		unsigned line, column;
		CXCursor SpecializationOf;
		CXCursor *overridden;
		unsigned num_overridden;
		unsigned RefNameRangeNr;
		CXSourceRange CursorExtent;
		CXSourceRange RefNameRange;

		ks = clang_getCursorKindSpelling(Cursor.kind);
		string = want_display_name? clang_getCursorDisplayName(Cursor) 
			: clang_getCursorSpelling(Cursor);
		printf("%s=%s", clang_getCString(ks),
			clang_getCString(string));
		clang_disposeString(ks);
		clang_disposeString(string);

		Referenced = clang_getCursorReferenced(Cursor);
		if (!clang_equalCursors(Referenced, clang_getNullCursor())) {
			if (clang_getCursorKind(Referenced) == CXCursor_OverloadedDeclRef) {
				unsigned I, N = clang_getNumOverloadedDecls(Referenced);
				printf("[");
				for (I = 0; I != N; ++I) {
					CXCursor Ovl = clang_getOverloadedDecl(Referenced, I);
					CXSourceLocation Loc;
					if (I)
						printf(", ");

					Loc = clang_getCursorLocation(Ovl);
					clang_getSpellingLocation(Loc, 0, &line, &column, 0);
					printf("%d:%d", line, column);          
				}
				printf("]");
			} else {
				CXSourceLocation Loc = clang_getCursorLocation(Referenced);
				clang_getSpellingLocation(Loc, 0, &line, &column, 0);
				printf(":%d:%d", line, column);
			}
		}

		if (clang_isCursorDefinition(Cursor))
			printf(" (Definition)");

		switch (clang_getCursorAvailability(Cursor)) {
	  case CXAvailability_Available:
		  break;

	  case CXAvailability_Deprecated:
		  printf(" (deprecated)");
		  break;

	  case CXAvailability_NotAvailable:
		  printf(" (unavailable)");
		  break;

	  case CXAvailability_NotAccessible:
		  printf(" (inaccessible)");
		  break;
		}

		if (clang_CXXMethod_isStatic(Cursor))
			printf(" (static)");
		if (clang_CXXMethod_isVirtual(Cursor))
			printf(" (virtual)");

		if (Cursor.kind == CXCursor_IBOutletCollectionAttr) {
			CXType T =
				clang_getCanonicalType(clang_getIBOutletCollectionType(Cursor));
			CXString S = clang_getTypeKindSpelling(T.kind);
			printf(" [IBOutletCollection=%s]", clang_getCString(S));
			clang_disposeString(S);
		}

		if (Cursor.kind == CXCursor_CXXBaseSpecifier) {
			enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(Cursor);
			unsigned isVirtual = clang_isVirtualBase(Cursor);
			const char *accessStr = 0;

			switch (access) {
		case CX_CXXInvalidAccessSpecifier:
			accessStr = "invalid"; break;
		case CX_CXXPublic:
			accessStr = "public"; break;
		case CX_CXXProtected:
			accessStr = "protected"; break;
		case CX_CXXPrivate:
			accessStr = "private"; break;
			}      

			printf(" [access=%s isVirtual=%s]", accessStr,
				isVirtual ? "true" : "false");
		}

		SpecializationOf = clang_getSpecializedCursorTemplate(Cursor);
		if (!clang_equalCursors(SpecializationOf, clang_getNullCursor())) {
			CXSourceLocation Loc = clang_getCursorLocation(SpecializationOf);
			CXString Name = clang_getCursorSpelling(SpecializationOf);
			clang_getSpellingLocation(Loc, 0, &line, &column, 0);
			printf(" [Specialization of %s:%d:%d]", 
				clang_getCString(Name), line, column);
			clang_disposeString(Name);
		}

		clang_getOverriddenCursors(Cursor, &overridden, &num_overridden);
		if (num_overridden) {      
			unsigned I;
			printf(" [Overrides ");
			for (I = 0; I != num_overridden; ++I) {
				CXSourceLocation Loc = clang_getCursorLocation(overridden[I]);
				clang_getSpellingLocation(Loc, 0, &line, &column, 0);
				if (I)
					printf(", ");
				printf("@%d:%d", line, column);
			}
			printf("]");
			clang_disposeOverriddenCursors(overridden);
		}

		if (Cursor.kind == CXCursor_InclusionDirective) {
			CXFile File = clang_getIncludedFile(Cursor);
			CXString Included = clang_getFileName(File);
			printf(" (%s)", clang_getCString(Included));
			clang_disposeString(Included);

			if (clang_isFileMultipleIncludeGuarded(TU, File))
				printf("  [multi-include guarded]");
		}

		CursorExtent = clang_getCursorExtent(Cursor);
		RefNameRange = clang_getCursorReferenceNameRange(Cursor, 
			CXNameRange_WantQualifier
			| CXNameRange_WantSinglePiece
			| CXNameRange_WantTemplateArgs,
			0);
		if (!clang_equalRanges(CursorExtent, RefNameRange))
			PrintRange(RefNameRange, "SingleRefName");

		for (RefNameRangeNr = 0; 1; RefNameRangeNr++) {
			RefNameRange = clang_getCursorReferenceNameRange(Cursor, 
				CXNameRange_WantQualifier
				| CXNameRange_WantTemplateArgs,
				RefNameRangeNr);
			if (clang_equalRanges(clang_getNullRange(), RefNameRange))
				break;
			if (!clang_equalRanges(CursorExtent, RefNameRange))
				PrintRange(RefNameRange, "RefName");
		}
	}
}

CXChildVisitResult printVisitor(CXCursor cursor, CXCursor parent, CXClientData client_data) {

	CXString kindString, displayType, cursorSpelling;

	kindString = clang_getCursorKindSpelling(cursor.kind);
	displayType = clang_getCursorDisplayName(cursor);
	cursorSpelling = clang_getCursorSpelling(cursor);

	switch(cursor.kind)
	{
		
		case CXCursor_ClassDecl:
		{
			printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
			break;
		}

		case CXCursor_StructDecl:
			{
				printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
				break;
			}

		case CXCursor_FieldDecl:
			{
				CXType type = clang_getCursorType(cursor);
				printf("%s: %s - %s: %d\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling), type);
				break;
			}

		// parameters
		case CXCursor_ParmDecl: 
			{
				CXType type = clang_getCursorType(cursor);
				printf("%s: %s - %s: %d\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling), type);
				
				// is parameter const???
				if(type.kind == CXType_Pointer || type.kind == CXType_LValueReference)
				{
					if(clang_isConstQualifiedType(clang_getPointeeType(type)))
						printf("is const");
				}

				if(clang_isConstQualifiedType(clang_getCursorType(cursor)))
					printf("is const");

				
				break;
			}

		//case CXCursor_ClassDecl: PrintCursor(cursor); break;
		// functions
		case CXCursor_FunctionDecl:
			{
				printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
				if (clang_CXXMethod_isStatic(cursor))
					printf(" (static)");
				if (clang_CXXMethod_isVirtual(cursor))
					printf(" (virtual)");

				// return-type
				CXType returnType = clang_getCursorResultType(cursor);
				CXCursor returnCursor = clang_getTypeDeclaration(returnType);	// check CXType, you idiot
				printf("returnType: %s!", clang_getCursorSpelling(returnCursor));

				//USR
				//printf("%s\n", clang_getCString(clang_getCursorUSR(cursor))); 
				break;
			}
		case CXCursor_OverloadedDeclRef:
			{
				unsigned N = clang_getNumOverloadedDecls(cursor);
				printf("overloads: %d", N);
				break;
			}
		case CXCursor_CXXAccessSpecifier:
			{
				// changing access
				enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);
				unsigned isVirtual = clang_isVirtualBase(cursor);
				const char *accessStr = 0;

				switch (access) {
				case CX_CXXInvalidAccessSpecifier:
					accessStr = "invalid"; break;
				case CX_CXXPublic:
					accessStr = "public"; break;
				case CX_CXXProtected:
					accessStr = "protected"; break;
				case CX_CXXPrivate:
					accessStr = "private"; break;
						}      

						printf(" [access=%s isVirtual=%s]\n", accessStr,
							isVirtual ? "true" : "false");

				break;
			}

			// TODO templates
	}

	

	
	//

	// ranges ...
	/*CXSourceRange range = clang_getCursorExtent(cursor);
	CXSourceLocation startLocation = clang_getRangeStart(range);
	CXSourceLocation endLocation = clang_getRangeEnd(range);

	CXFile file;
	unsigned int line, column, offset;
	clang_getInstantiationLocation(startLocation, &file, &line, &column, &offset);
	printf("Start: Line: %u Column: %u Offset: %u\n", line, column, offset);
	clang_getInstantiationLocation(endLocation, &file, &line, &column, &offset);
	printf("End: Line: %u Column: %u Offset: %u\n", line, column, offset);*/

	return CXChildVisit_Recurse;
}

int main(int argc, char *argv[]) {

	std::cout << "argc = " << argc << std::endl;
	for(int i = 0; i < argc; i++)
		std::cout << "argv[" << i << "] = " << argv[i] << std::endl; 

	CXIndex Index = clang_createIndex(0, 0);
	CXTranslationUnit TU = clang_parseTranslationUnit(Index, 0,
		argv, argc, 0, 0, CXTranslationUnit_None);

	if(!TU)
	{

	}
	else
	{
		// diagnostics 
		for (unsigned I = 0, N = clang_getNumDiagnostics(TU); I != N; ++I) {
			CXDiagnostic Diag = clang_getDiagnostic(TU, I);
			CXString String = clang_formatDiagnostic(Diag,
				clang_defaultDiagnosticDisplayOptions());
			fprintf(stderr, "%s\n", clang_getCString(String));
			clang_disposeString(String);
		}

		// source-tree
		CXCursor rootCursor = clang_getTranslationUnitCursor(TU);
		clang_visitChildren(rootCursor, printVisitor, NULL);

		// dispose unit
		clang_disposeTranslationUnit(TU);
	}
	
	clang_disposeIndex(Index);

	int foo;
	std::cin >> foo;

	return 0;
}