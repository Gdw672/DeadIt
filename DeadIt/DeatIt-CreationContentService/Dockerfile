# ������� ����� ��� runtime (Linux)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 80

# ����� ��� ������ (Linux)
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["DeatIt-CreationContentService.csproj", "."]
RUN dotnet restore "./DeatIt-CreationContentService.csproj"
COPY . . 
WORKDIR "/src"
RUN dotnet build "./DeatIt-CreationContentService.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ���� ����������
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./DeatIt-CreationContentService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ��������� ����� ��� ���������� (Linux)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish . 
ENTRYPOINT ["dotnet", "DeatIt-CreationContentService.dll"]
